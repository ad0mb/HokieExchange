import os
from contextlib import asynccontextmanager
from pymongo import AsyncMongoClient
from . import transport
from .repository import ChatRepository

@asynccontextmanager
async def lifespan(app):
    client = None
    try:
        uri = os.getenv("MONGODB_URI")
        if uri:
            client = AsyncMongoClient(uri, serverSelectionTimeoutMS=5000, tz_aware=True)
            await client.admin.command("ping")
            transport.repository = ChatRepository(client.get_default_database())
            await transport.repository.initialize()
        yield
    finally:
        transport.repository = None
        if client:
            await client.close()

