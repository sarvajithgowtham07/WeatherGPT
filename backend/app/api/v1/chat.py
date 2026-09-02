from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.chat_session import ChatSession
from app.models.chat_message import ChatMessage
from app.schemas.chat import ChatSessionCreate, ChatMessageCreate


router = APIRouter()


@router.post("/chat/sessions")
def create_chat_session(
    session_data: ChatSessionCreate,
    db: Session = Depends(get_db)
):
    chat_session = ChatSession(
        user_id=session_data.user_id
    )

    db.add(chat_session)
    db.commit()
    db.refresh(chat_session)

    return chat_session


@router.post("/chat/messages")
def create_chat_message(
    message_data: ChatMessageCreate,
    db: Session = Depends(get_db)
):
    message = ChatMessage(
        session_id=message_data.session_id,
        role=message_data.role,
        message=message_data.message
    )

    db.add(message)
    db.commit()
    db.refresh(message)

    return message