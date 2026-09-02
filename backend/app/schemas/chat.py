from pydantic import BaseModel


class ChatSessionCreate(BaseModel):
    user_id: int


class ChatMessageCreate(BaseModel):
    session_id: int
    role: str
    message: str