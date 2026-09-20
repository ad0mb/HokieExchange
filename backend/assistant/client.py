"""Genie Chat-mode API adapter. Databricks owns SQL generation and execution."""
import asyncio
import os
import re
from collections.abc import Awaitable, Callable
from urllib.parse import urlsplit

import httpx
from pydantic import BaseModel, Field, ValidationError
from typing import Literal


class Listing(BaseModel):
    type: Literal["service", "item"]
    id: int = Field(gt=0, le=9007199254740991)
    name: str = Field(min_length=1, max_length=200)
    description: str = Field(default="", max_length=2000)
    price: float | None = Field(default=None, ge=0, le=1000000, allow_inf_nan=False)
    currency: Literal["USD"] = "USD"
    location: str = Field(default="", max_length=300)
    stock: int | None = Field(default=None, ge=0)
    vendor_name: str = Field(default="", max_length=200)
    rating: float | None = Field(default=None, ge=0, le=5, allow_inf_nan=False)
    available_slots: int | None = Field(default=None, ge=0)


class AgentReply(BaseModel):
    text: str
    listings: list[Listing] = Field(default_factory=list)
    conversation_id: str | None = None


class GenieError(RuntimeError):
    """A safe, user-facing message, never raw remote errors or SQL."""


def settings() -> tuple[str, str, str]:
    host = os.getenv("DATABRICKS_HOST", "").strip().rstrip("/")
    space = os.getenv("DATABRICKS_GENIE_SPACE_ID", "").strip()
    token = os.getenv("DATABRICKS_TOKEN", "").strip()
    parsed = urlsplit(host)
    if parsed.scheme != "https" or not parsed.netloc or parsed.path or parsed.query or parsed.fragment or parsed.username or parsed.password:
        raise GenieError("The assistant needs its Databricks workspace URL configured on the backend.")
    if not re.fullmatch(r"[a-fA-F0-9]{32}", space):
        raise GenieError("The assistant needs its Genie Space ID configured on the backend.")
    if not token:
        raise GenieError("The assistant needs a Databricks token configured on the backend.")
    return host, space, token


def _id(value) -> str:
    # IDs are server-supplied opaque path segments; do not accept paths or URLs.
    if not isinstance(value, str) or not re.fullmatch(r"[a-zA-Z0-9_-]{1,128}", value):
        raise GenieError("Databricks returned an invalid conversation or message identifier.")
    return value


async def _request(client: httpx.AsyncClient, method: str, path: str, **kwargs) -> dict:
    response = await client.request(method, path, **kwargs)
    if response.status_code == 401:
        raise GenieError("The Databricks token is invalid or expired. Update it on the backend.")
    if response.status_code == 403:
        raise GenieError("The Databricks account needs access to this Genie agent, its warehouse, or its data.")
    if response.status_code == 404:
        raise GenieError("The Genie agent or conversation could not be found. Check the configured Space ID.")
    if response.status_code == 429:
        raise GenieError("Databricks is busy or rate-limited. Please try again shortly.")
    response.raise_for_status()
    data = response.json()
    if not isinstance(data, dict):
        raise GenieError("Databricks returned an unexpected response.")
    return data


def listings_from_result(data: dict) -> list[Listing]:
    statement = data.get("statement_response", data)
    columns = statement.get("manifest", {}).get("schema", {}).get("columns", [])
    names = [str(col.get("name", "")).lower() for col in columns]
    rows = statement.get("result", {}).get("data_array", [])
    listings = []
    for values in rows[:50]:
        if not isinstance(values, list):
            continue
        row = dict(zip(names, values))
        # Never create a cart listing from prose, aggregates, or a name without a stable ID.
        for kind in ("service", "item"):
            name = row.get(kind + "_name")
            identifier = row.get(kind + "_id")
            if name is None or identifier is None:
                continue
            try:
                listings.append(Listing.model_validate({
                    "type": kind, "id": identifier, "name": name,
                    "price": row.get("price"), "currency": row.get("currency") or "USD",
                    "description": row.get("description") or "", "location": row.get("location") or "",
                    "stock": row.get("stock") if kind == "item" else None,
                    "vendor_name": row.get("vendor_name") or row.get("seller_name") or "",
                    "rating": row.get("vendor_avg_rating", row.get("rating")),
                    "available_slots": row.get("available_slots") if kind == "service" else None,
                }))
            except ValidationError:
                continue
    return listings


async def _finish(client: httpx.AsyncClient, base: str, conversation: str, message: dict) -> AgentReply:
    message_id = _id(message.get("message_id") or message.get("id"))
    path = f"{base}/conversations/{conversation}/messages/{message_id}"
    delay = 1
    while message.get("status") != "COMPLETED":
        if message.get("status") in ("FAILED", "CANCELLED", "QUERY_RESULT_EXPIRED"):
            raise GenieError("Genie could not complete the query. Check its data and warehouse access, then try again.")
        await asyncio.sleep(delay)
        delay = min(delay * 2, 5)
        message = await _request(client, "GET", path)

    texts, titles, listings = [], [], []
    query_count = 0
    missing_ids = False
    for attachment in message.get("attachments", []):
        text = attachment.get("text", {}).get("content")
        if isinstance(text, str) and text.strip():
            texts.append(text.strip())
        query = attachment.get("query")
        if isinstance(query, dict):
            query_count += 1
            if query.get("title"):
                titles.append(str(query["title"]))
            attachment_id = _id(attachment.get("attachment_id") or attachment.get("id"))
            result = await _request(client, "GET", f"{path}/attachments/{attachment_id}/query-result")
            while result.get("statement_response", {}).get("status", {}).get("state") in ("PENDING", "RUNNING"):
                await asyncio.sleep(2)
                result = await _request(client, "GET", f"{path}/attachments/{attachment_id}/query-result")
            statement = result.get("statement_response", {})
            if statement.get("status", {}).get("state") in ("FAILED", "CANCELED", "CLOSED"):
                raise GenieError("Genie's query results are unavailable. Please try again.")
            extracted = listings_from_result(result)
            if statement.get("result", {}).get("data_array") and not extracted:
                missing_ids = True
            listings.extend(extracted)

    listings = list({(row.type, row.id): row for row in listings}.values())[:50]
    if texts:
        answer = "\n\n".join(texts)
    elif listings:
        answer = f"I found {len(listings)} matching listings. You can review them below."
    elif query_count and not missing_ids:
        answer = "No matching listings were returned. Try changing your search or budget."
    elif titles:
        answer = "\n".join(titles) + "\nThe query returned data, but no listing IDs and names for cards."
    else:
        raise GenieError("Genie returned no answer. Please try rephrasing your question.")
    return AgentReply(text=answer, listings=listings, conversation_id=conversation)


async def reply(user_text: str, conversation_id: str | None = None,
                on_conversation: Callable[[str], Awaitable[None]] | None = None) -> AgentReply:
    host, space, token = settings()
    base = f"/api/2.0/genie/spaces/{space}"
    try:
        async with asyncio.timeout(180):
            async with httpx.AsyncClient(base_url=host, headers={"Authorization": f"Bearer {token}"},
                                         timeout=httpx.Timeout(30, connect=10), follow_redirects=False) as client:
                if conversation_id:
                    conversation = _id(conversation_id)
                    message = await _request(client, "POST", f"{base}/conversations/{conversation}/messages",
                                             json={"content": user_text})
                else:
                    data = await _request(client, "POST", f"{base}/start-conversation", json={"content": user_text})
                    message = data.get("message", {})
                    conversation = _id(data.get("conversation_id") or data.get("conversation", {}).get("conversation_id")
                                       or data.get("conversation", {}).get("id") or message.get("conversation_id"))
                if on_conversation:
                    await on_conversation(conversation)
                return await _finish(client, base, conversation, message)
    except (TimeoutError, httpx.TimeoutException) as exc:
        raise GenieError("Genie is taking too long to respond. Please try again in a moment.") from exc
    except httpx.HTTPError as exc:
        raise GenieError("Databricks is temporarily unavailable. Please try again shortly.") from exc
