"""Isolated Genie API and chat integration tests; no live network or databases."""
import asyncio
import json
import os
import unittest
from types import SimpleNamespace
from unittest.mock import AsyncMock, patch

import httpx
from assistant.client import AgentReply, GenieError, listings_from_result, reply
from chat import transport
from chat.repository import ChatRepository

ENV = {"DATABRICKS_HOST": "https://example.databricks.com",
       "DATABRICKS_GENIE_SPACE_ID": "a" * 32, "DATABRICKS_TOKEN": "test-only"}


def result(rows=None):
    return {"statement_response": {"status": {"state": "SUCCEEDED"},
        "manifest": {"schema": {"columns": [{"name": n} for n in
            ["service_id", "service_name", "price", "vendor_name", "vendor_avg_rating"]]}},
        "result": {"data_array": rows if rows is not None else [["5", "Haircut", "20", "Alice", "5"]]}}}


class ListingTests(unittest.TestCase):
    def test_query_rows_become_cards(self):
        cards = listings_from_result(result())
        self.assertEqual((cards[0].id, cards[0].name, cards[0].price, cards[0].rating), (5, "Haircut", 20, 5))

    def test_invalid_rows_are_not_cards(self):
        self.assertEqual(listings_from_result(result([[None, "Haircut", "20"], ["5", "Haircut", "NaN"]])), [])

    def test_items_and_empty_results(self):
        data = result()
        data["statement_response"]["manifest"]["schema"]["columns"] = [{"name": n} for n in ["item_id", "item_name", "price", "stock"]]
        data["statement_response"]["result"]["data_array"] = [["2", "Book", "12.50", "0"]]
        item = listings_from_result(data)[0]
        self.assertEqual((item.type, item.stock, item.price), ("item", 0, 12.5))
        self.assertEqual(listings_from_result(result([])), [])


class APITests(unittest.IsolatedAsyncioTestCase):
    async def call(self, handler, text="Haircut please", conversation=None):
        self.requests = []
        def respond(request):
            self.requests.append(request)
            return handler(request)
        client = httpx.AsyncClient(base_url=ENV["DATABRICKS_HOST"],
            headers={"Authorization": "Bearer test-only"}, transport=httpx.MockTransport(respond))
        self.remember = AsyncMock()
        with patch.dict(os.environ, ENV), patch("assistant.client.httpx.AsyncClient", return_value=client), \
             patch("assistant.client.asyncio.sleep", new_callable=AsyncMock):
            return await reply(text, conversation, self.remember)

    async def test_start_poll_and_result(self):
        def handler(request):
            if request.method == "POST":
                return httpx.Response(200, json={"conversation": {"id": "conv"}, "message": {"id": "msg", "status": "SUBMITTED"}})
            if request.url.path.endswith("query-result"):
                return httpx.Response(200, json=result())
            return httpx.Response(200, json={"message_id": "msg", "status": "COMPLETED", "attachments": [
                {"text": {"content": "Here is a haircut."}}, {"attachment_id": "att", "query": {"title": "Haircuts"}}]})
        answer = await self.call(handler, "Show haircuts for $20 or less")
        self.assertEqual(answer.conversation_id, "conv")
        self.assertEqual(answer.listings[0].id, 5)
        self.assertEqual(json.loads(self.requests[0].content), {"content": "Show haircuts for $20 or less"})
        self.assertTrue(self.requests[0].url.path.endswith("/start-conversation"))
        self.assertNotIn("test-only", self.requests[0].content.decode())
        self.remember.assert_awaited_once_with("conv")

    async def test_followup_uses_existing_conversation(self):
        answer = await self.call(lambda r: httpx.Response(200, json={"id": "msg2", "status": "COMPLETED",
            "attachments": [{"text": {"content": "At Squires."}}]}), "Where is it?", "existing")
        self.assertEqual(answer.text, "At Squires.")
        self.assertTrue(self.requests[0].url.path.endswith("/conversations/existing/messages"))
        self.assertEqual(len(self.requests), 1)

    async def test_failed_query_has_safe_error(self):
        with self.assertRaises(GenieError) as caught:
            await self.call(lambda r: httpx.Response(200, json={"conversation_id": "conv", "message": {
                "id": "msg", "status": "FAILED", "error": {"message": "private SQL details"}}}))
        self.assertNotIn("private", str(caught.exception))

    async def test_auth_throttle_and_missing_resource_no_retries(self):
        for status in (401, 403, 404, 429):
            with self.subTest(status=status), self.assertRaises(GenieError):
                await self.call(lambda r: httpx.Response(status))
            self.assertEqual(len(self.requests), 1)

    async def test_missing_config_no_network(self):
        with patch.dict(os.environ, {"DATABRICKS_HOST": ""}), patch("assistant.client.httpx.AsyncClient") as client:
            with self.assertRaises(GenieError):
                await reply("Hello")
        client.assert_not_called()

    async def test_timeout_has_safe_error(self):
        def handler(request):
            raise httpx.ReadTimeout("private details")
        with self.assertRaises(GenieError) as caught:
            await self.call(handler)
        self.assertIn("taking too long", str(caught.exception))


class SessionTests(unittest.IsolatedAsyncioTestCase):
    async def test_session_keys_isolate_students_and_spaces(self):
        sessions = AsyncMock()
        sessions.find_one.return_value = {"conversation_id": "saved"}
        repo = ChatRepository(SimpleNamespace(chat_messages=AsyncMock(), chat_agent_sessions=sessions))
        self.assertEqual(await repo.get_agent_conversation(1, "space-a"), "saved")
        await repo.get_agent_conversation(2, "space-a")
        await repo.get_agent_conversation(1, "space-b")
        calls = sessions.find_one.await_args_list
        self.assertEqual(len({c.args[0]["_id"] for c in calls}), 3)
        self.assertIn("$gt", calls[0].args[0]["updated_at"])
        await repo.save_agent_conversation(1, "space-a", "saved")
        self.assertEqual(sessions.update_one.await_args.args[0]["_id"], calls[0].args[0]["_id"])
        self.assertTrue(sessions.update_one.await_args.kwargs["upsert"])

    async def test_queue_passes_actual_messages_and_clears_typing(self):
        repo = AsyncMock()
        repo.get_agent_conversation.return_value = None
        repo.insert.return_value = {"id": "reply"}
        texts = []
        async def answer(text, conversation, on_conversation):
            texts.append(text)
            await on_conversation("conv")
            return AgentReply(text="Answer")
        with patch.dict(os.environ, ENV), patch.object(transport, "repository", repo), \
             patch.object(transport.agent_client, "reply", side_effect=answer), \
             patch.object(transport.sio, "emit", new_callable=AsyncMock) as emit:
            first = asyncio.create_task(transport._answer_assistant(5, {"text": "First"}))
            second = asyncio.create_task(transport._answer_assistant(5, {"text": "Second"}, first))
            transport.assistant_tasks[5] = second
            await asyncio.gather(first, second)
        self.assertEqual(texts, ["First", "Second"])
        self.assertEqual(repo.save_agent_conversation.await_count, 2)
        self.assertNotIn(5, transport.assistant_tasks)
        self.assertEqual(emit.call_args_list[-1].args, ("bot_typing", {"typing": False}))

    async def test_failure_still_clears_typing(self):
        repo = AsyncMock()
        repo.get_agent_conversation.side_effect = RuntimeError("db unavailable")
        repo.insert.side_effect = RuntimeError("db unavailable")
        with patch.dict(os.environ, ENV), patch.object(transport, "repository", repo), \
             patch.object(transport.sio, "emit", new_callable=AsyncMock) as emit:
            task = asyncio.create_task(transport._answer_assistant(5, {"text": "Hello"}))
            transport.assistant_tasks[5] = task
            await task
        self.assertEqual(emit.call_args_list[-1].args, ("bot_typing", {"typing": False}))


if __name__ == "__main__":
    unittest.main()
