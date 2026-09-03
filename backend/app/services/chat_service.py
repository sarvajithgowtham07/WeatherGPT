from sqlalchemy import text
from app.db.database import engine

from app.ai.profession_detector import detect_profession
from app.ai.response_generator import generate_chat_response
from app.services.weather_service import get_weather


def create_weather_context(weather_data: dict) -> dict:

    current = weather_data.get("current", {})
    hourly = weather_data.get("hourly", {})
    daily = weather_data.get("daily", {})

    hourly_times = hourly.get("time", [])
    hourly_temperatures = hourly.get("temperature_2m", [])
    hourly_rain = hourly.get("precipitation_probability", [])

    hourly_summary = []

    for i in range(min(6, len(hourly_times))):
        hourly_summary.append(
            f"{hourly_times[i]}: "
            f"{hourly_temperatures[i]}°C, "
            f"rain probability {hourly_rain[i]}%"
        )

    daily_times = daily.get("time", [])
    daily_max = daily.get("temperature_2m_max", [])
    daily_min = daily.get("temperature_2m_min", [])
    daily_rain = daily.get("precipitation_probability_max", [])

    daily_summary = []

    for i in range(min(7, len(daily_times))):
        daily_summary.append(
            f"{daily_times[i]}: "
            f"{daily_min[i]}°C - {daily_max[i]}°C, "
            f"rain probability {daily_rain[i]}%"
        )

    return {
        "temperature": current.get("temperature_2m"),
        "apparent_temperature": current.get("apparent_temperature"),
        "humidity": current.get("relative_humidity_2m"),
        "precipitation": current.get("precipitation"),
        "wind_speed": current.get("wind_speed_10m"),
        "weather_code": current.get("weather_code"),
        "hourly_summary": "\n".join(hourly_summary),
        "daily_summary": "\n".join(daily_summary)
    }


async def chat_with_user(user_id: int, message: str):

    with engine.connect() as connection:

        user_result = connection.execute(
            text("""
                SELECT name, profession, language, latitude, longitude
                FROM users
                WHERE id = :user_id
            """),
            {"user_id": user_id}
        ).mappings().first()

        if not user_result:
            raise ValueError("User not found")

        previous_profession = user_result["profession"]
        language = user_result["language"] or "English"
        latitude = user_result["latitude"]
        longitude = user_result["longitude"]

    # --------------------------------
    # 1. DETECT PROFESSION USING AI
    # --------------------------------

    detected_profession = detect_profession(
        message=message,
        previous_profession=previous_profession
    )

    # --------------------------------
    # 2. GET REAL WEATHER DATA
    # --------------------------------

    weather_context = {}

    if latitude is not None and longitude is not None:

        weather_data = await get_weather(
            latitude,
            longitude
        )

        weather_context = create_weather_context(
            weather_data
        )

    # --------------------------------
    # 3. GENERATE PERSONALIZED ANSWER
    # --------------------------------

    ai_response = generate_chat_response(
        user_message=message,
        profession=detected_profession,
        language=language,
        latitude=latitude,
        longitude=longitude,
        weather_context=weather_context
    )

    # --------------------------------
    # 4. SAVE PROFESSION + CHAT
    # --------------------------------

    with engine.begin() as connection:

        connection.execute(
            text("""
                UPDATE users
                SET profession = :profession,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = :user_id
            """),
            {
                "profession": detected_profession,
                "user_id": user_id
            }
        )

        session_result = connection.execute(
            text("""
                SELECT id
                FROM chat_sessions
                WHERE user_id = :user_id
                ORDER BY created_at DESC
                LIMIT 1
            """),
            {"user_id": user_id}
        ).mappings().first()

        if session_result:

            session_id = session_result["id"]

        else:

            session_result = connection.execute(
                text("""
                    INSERT INTO chat_sessions (user_id)
                    VALUES (:user_id)
                    RETURNING id
                """),
                {"user_id": user_id}
            ).mappings().first()

            session_id = session_result["id"]

        connection.execute(
            text("""
                INSERT INTO chat_messages
                (session_id, role, message)
                VALUES
                (:session_id, 'user', :message)
            """),
            {
                "session_id": session_id,
                "message": message
            }
        )

        connection.execute(
            text("""
                INSERT INTO chat_messages
                (session_id, role, message)
                VALUES
                (:session_id, 'assistant', :message)
            """),
            {
                "session_id": session_id,
                "message": ai_response
            }
        )

    return {
        "response": ai_response,
        "session_id": session_id,
        "detected_profession": detected_profession
    }