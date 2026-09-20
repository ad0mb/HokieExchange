from .schemas import Pair, SendMessage

def conversation_key(pair: Pair):
    return f"student:{pair.student_id}:vendor:{pair.vendor_id}"

class ChatService:
    def __init__(self, repository):
        self.repository = repository

    async def send(self, pair, payload):
        message = SendMessage.model_validate(payload)
        return await self.repository.insert(pair, conversation_key(pair), message.text)
