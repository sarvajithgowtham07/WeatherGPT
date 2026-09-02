from sqlalchemy import Column, Integer, ForeignKey, DateTime
from datetime import datetime

from app.db.database import Base


class ChatSession(Base):
    __tablename__ = "chat_sessions"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=True
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )