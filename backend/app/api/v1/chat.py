from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.chat_session import ChatSession
from app.models.chat_message import ChatMessage
from app.models.user import User
from app.schemas.chat import ChatSessionCreate, ChatMessageCreate

from app.ai.profession_detector import detect_profession
from app.ai.response_generator import generate_chat_response
from app.services.weather_service import get_weather


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
async def create_chat_message(
    message_data: ChatMessageCreate,
    db: Session = Depends(get_db)
):
    # --------------------------------
    # 1. Check chat session
    # --------------------------------

    chat_session = db.query(ChatSession).filter(
        ChatSession.id == message_data.session_id
    ).first()

    if not chat_session:
        raise HTTPException(
            status_code=404,
            detail="Chat session not found"
        )

    # --------------------------------
    # 2. Get user
    # --------------------------------

    user = db.query(User).filter(
        User.id == chat_session.user_id
    ).first()

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    # --------------------------------
    # 3. Save user's message
    # --------------------------------

    user_message = ChatMessage(
        session_id=message_data.session_id,
        role="user",
        message=message_data.message
    )

    db.add(user_message)
    db.commit()
    db.refresh(user_message)

    # --------------------------------
    # 4. Detect profession using AI
    # --------------------------------

    detected_profession = detect_profession(
        message=message_data.message,
        previous_profession=user.profession
    )

    # --------------------------------
    # 5. Get real weather
    # --------------------------------

    weather_context = {}

    if user.latitude is not None and user.longitude is not None:

        weather_data = await get_weather(
            user.latitude,
            user.longitude
        )

        current = weather_data.get("current", {})
        hourly = weather_data.get("hourly", {})
        daily = weather_data.get("daily", {})

        weather_context = {
            "temperature": current.get("temperature_2m"),
            "apparent_temperature": current.get(
                "apparent_temperature"
            ),
            "humidity": current.get(
                "relative_humidity_2m"
            ),
            "precipitation": current.get(
                "precipitation"
            ),
            "wind_speed": current.get(
                "wind_speed_10m"
            ),
            "weather_code": current.get(
                "weather_code"
            ),
            "hourly_summary": str(hourly),
            "daily_summary": str(daily)
        }

    # --------------------------------
    # 6. Generate Gemini response
    # --------------------------------

    ai_response = generate_chat_response(
        user_message=message_data.message,
        profession=detected_profession,
        language=user.language or "English",
        latitude=user.latitude,
        longitude=user.longitude,
        weather_context=weather_context
    )

    # --------------------------------
    # 7. Update detected profession
    # --------------------------------

    user.profession = detected_profession

    db.add(user)

    # --------------------------------
    # 8. Save AI response
    # --------------------------------

    assistant_message = ChatMessage(
        session_id=message_data.session_id,
        role="assistant",
        message=ai_response
    )

    db.add(assistant_message)

    db.commit()
    db.refresh(assistant_message)

    # --------------------------------
    # 9. Return result
    # --------------------------------

    return {
        "user_message": message_data.message,
        "response": ai_response,
        "session_id": message_data.session_id,
        "detected_profession": detected_profession,
        "assistant_message_id": assistant_message.id
    }