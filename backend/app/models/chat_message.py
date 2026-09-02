from sqlalchemy import Column, Integer, ForeignKey, String, Text, DateTime
from datetime import datetime

from app.db.database import Base


class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(Integer, primary_key=True, index=True)

    session_id = Column(
        Integer,
        ForeignKey("chat_sessions.id", ondelete="CASCADE"),
        nullable=True
    )

    role = Column(String(20), nullable=False)

    message = Column(Text, nullable=False)

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )