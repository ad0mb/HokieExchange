from pydantic import BaseModel, Field, ConfigDict

class SendMessage(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)
    recipient_id: int = Field(ge=0)
    text: str = Field(min_length=1, max_length=4000)
