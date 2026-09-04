from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import re

from app.db.database import get_db
from app.models.chat_session import ChatSession
from app.models.chat_message import ChatMessage
from app.models.user import User
from app.schemas.chat import ChatSessionCreate, ChatMessageCreate

from app.ai.response_generator import generate_chat_response
from app.services.weather_service import get_weather
from app.services.geocoding_service import search_location


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


def extract_location_locally(message: str):
    """
    Extract common location questions without using Gemini.
    This keeps basic weather queries working when Gemini quota is exhausted.
    """

    patterns = [
        r"\bwhat(?:'s| is) the weather in\s+(.+)$",
        r"\bweather in\s+(.+)$",
        r"\btemperature in\s+(.+)$",
        r"\bforecast in\s+(.+)$",
        r"\bweather at\s+(.+)$",
        r"\btemperature at\s+(.+)$",
        r"\bforecast for\s+(.+)$",
        r"\bweather for\s+(.+)$",
    ]

    text = message.strip()

    for pattern in patterns:
        match = re.search(pattern, text, re.IGNORECASE)

        if match:
            location = match.group(1).strip()

            location = re.sub(
                r"\b(right now|today|tomorrow|now)\b",
                "",
                location,
                flags=re.IGNORECASE
            ).strip(" .,!?:;")

            if location:
                return location

    return None


def weather_code_description(code):
    """
    Convert Open-Meteo weather codes into readable text.
    """

    descriptions = {
        0: "clear sky",
        1: "mainly clear",
        2: "partly cloudy",
        3: "overcast",
        45: "foggy",
        48: "foggy",
        51: "light drizzle",
        53: "moderate drizzle",
        55: "heavy drizzle",
        61: "light rain",
        63: "moderate rain",
        65: "heavy rain",
        71: "light snow",
        73: "moderate snow",
        75: "heavy snow",
        80: "light rain showers",
        81: "moderate rain showers",
        82: "heavy rain showers",
        95: "thunderstorm",
        96: "thunderstorm with hail",
        99: "thunderstorm with heavy hail",
    }

    return descriptions.get(code, "mixed weather conditions")


def build_weather_fallback(
    location_name,
    weather_context
):
    """
    Deterministic response used when Gemini is unavailable.
    """

    if not weather_context:
        return (
            f"Weather information for {location_name} "
            "is currently unavailable."
        )

    temperature = weather_context.get("temperature")
    apparent_temperature = weather_context.get(
        "apparent_temperature"
    )
    humidity = weather_context.get("humidity")
    precipitation = weather_context.get("precipitation")
    wind_speed = weather_context.get("wind_speed")
    weather_code = weather_context.get("weather_code")

    condition = weather_code_description(weather_code)

    response = f"Current weather in {location_name}: {condition}."

    if temperature is not None:
        response += f" Temperature: {temperature}°C."

    if apparent_temperature is not None:
        response += (
            f" Feels like: {apparent_temperature}°C."
        )

    if humidity is not None:
        response += f" Humidity: {humidity}%."

    if precipitation is not None:
        response += (
            f" Precipitation: {precipitation} mm."
        )

    if wind_speed is not None:
        response += (
            f" Wind speed: {wind_speed} km/h."
        )

    return response


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
    # 4. Stored profession
    # --------------------------------

    detected_profession = user.profession or "General User"

    # --------------------------------
    # 5. Get user's saved-location weather
    # --------------------------------

    weather_context = {}

    if (
        user.latitude is not None
        and user.longitude is not None
    ):
        try:
            weather_data = await get_weather(
                user.latitude,
                user.longitude
            )

            current = weather_data.get(
                "current",
                {}
            )

            hourly = weather_data.get(
                "hourly",
                {}
            )

            daily = weather_data.get(
                "daily",
                {}
            )

            weather_context = {
                "temperature": current.get(
                    "temperature_2m"
                ),
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

        except Exception as error:
            print(
                f"Weather API error: {error}"
            )

            weather_context = {}

    # --------------------------------
    # 6. User language
    # --------------------------------

    language = user.language or "English"

    print(
        f"[chat] user_id={user.id} "
        f"saved_language={user.language!r} "
        f"using_language={language!r}"
    )

    # --------------------------------
    # 7. Detect requested location
    #    WITHOUT Gemini first
    # --------------------------------

    queried_location_name = None
    queried_weather_context = {}

    extracted_place = extract_location_locally(
        message_data.message
    )

    print(
        f"[chat] local_location={extracted_place!r}"
    )

    # --------------------------------
    # 8. Get requested location weather
    # --------------------------------

    if extracted_place:

        try:
            geo_result = await search_location(
                extracted_place
            )

            if geo_result:

                queried_location_name = (
                    geo_result.get("city")
                    or geo_result.get("name")
                    or extracted_place
                )

                queried_weather_data = await get_weather(
                    geo_result["latitude"],
                    geo_result["longitude"]
                )

                q_current = queried_weather_data.get(
                    "current",
                    {}
                )

                q_hourly = queried_weather_data.get(
                    "hourly",
                    {}
                )

                q_daily = queried_weather_data.get(
                    "daily",
                    {}
                )

                queried_weather_context = {
                    "temperature": q_current.get(
                        "temperature_2m"
                    ),
                    "apparent_temperature": q_current.get(
                        "apparent_temperature"
                    ),
                    "humidity": q_current.get(
                        "relative_humidity_2m"
                    ),
                    "precipitation": q_current.get(
                        "precipitation"
                    ),
                    "wind_speed": q_current.get(
                        "wind_speed_10m"
                    ),
                    "weather_code": q_current.get(
                        "weather_code"
                    ),
                    "hourly_summary": str(q_hourly),
                    "daily_summary": str(q_daily)
                }

                print(
                    f"[chat] queried_location="
                    f"{queried_location_name}"
                )

        except Exception as error:

            print(
                f"Queried location weather error: {error}"
            )

            queried_location_name = None
            queried_weather_context = {}

    # --------------------------------
    # 9. If a specific location was
    #    successfully found, use its
    #    weather directly.
    #
    #    This works even when Gemini
    #    has exhausted its quota.
    # --------------------------------

    if (
        queried_location_name
        and queried_weather_context
    ):

        ai_response = build_weather_fallback(
            queried_location_name,
            queried_weather_context
        )

    else:

        # --------------------------------
        # 10. Try Gemini for normal chat
        # --------------------------------

        try:

            ai_response = generate_chat_response(
                user_message=message_data.message,
                profession=detected_profession,
                language=language,
                latitude=user.latitude,
                longitude=user.longitude,
                weather_context=weather_context,
                queried_location_name=queried_location_name,
                queried_weather_context=queried_weather_context
            )

        except Exception as error:

            print(
                f"Gemini AI error: {error}"
            )

            # --------------------------------
            # 11. Gemini fallback for saved
            #     home location
            # --------------------------------

            if weather_context:

                ai_response = build_weather_fallback(
                    "your location",
                    weather_context
                )

            else:

                ai_response = (
                    "I can provide weather information, "
                    "but the AI service is temporarily "
                    "unavailable and no weather data "
                    "could be retrieved."
                )

    # --------------------------------
    # 12. Save AI/fallback response
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
    # 13. Return response
    # --------------------------------

    return {
        "user_message": message_data.message,
        "response": ai_response,
        "session_id": message_data.session_id,
        "detected_profession": detected_profession,
        "assistant_message_id": assistant_message.id
    }