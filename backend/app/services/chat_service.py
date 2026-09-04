import re

from sqlalchemy import text

from app.db.database import engine
from app.ai.profession_detector import detect_profession
from app.ai.response_generator import generate_chat_response
from app.services.weather_service import get_weather
from app.services.geocoding_service import search_location


def create_weather_context(weather_data: dict) -> dict:
    current = weather_data.get("current", {})
    hourly = weather_data.get("hourly", {})
    daily = weather_data.get("daily", {})

    hourly_times = hourly.get("time", [])
    hourly_temperatures = hourly.get("temperature_2m", [])
    hourly_rain = hourly.get("precipitation_probability", [])

    hourly_summary = []

    for i in range(min(6, len(hourly_times))):
        temp = (
            hourly_temperatures[i]
            if i < len(hourly_temperatures)
            else "N/A"
        )

        rain = (
            hourly_rain[i]
            if i < len(hourly_rain)
            else "N/A"
        )

        hourly_summary.append(
            f"{hourly_times[i]}: "
            f"{temp}°C, "
            f"rain probability {rain}%"
        )

    daily_times = daily.get("time", [])
    daily_max = daily.get("temperature_2m_max", [])
    daily_min = daily.get("temperature_2m_min", [])
    daily_rain = daily.get("precipitation_probability_max", [])

    daily_summary = []

    for i in range(min(7, len(daily_times))):
        mn = (
            daily_min[i]
            if i < len(daily_min)
            else "N/A"
        )

        mx = (
            daily_max[i]
            if i < len(daily_max)
            else "N/A"
        )

        rain = (
            daily_rain[i]
            if i < len(daily_rain)
            else "N/A"
        )

        daily_summary.append(
            f"{daily_times[i]}: "
            f"{mn}°C - {mx}°C, "
            f"rain probability {rain}%"
        )

    return {
        "temperature": current.get("temperature_2m"),
        "apparent_temperature": current.get("apparent_temperature"),
        "humidity": current.get("relative_humidity_2m"),
        "precipitation": current.get("precipitation"),
        "wind_speed": current.get("wind_speed_10m"),
        "weather_code": current.get("weather_code"),
        "hourly_summary": "\n".join(hourly_summary),
        "daily_summary": "\n".join(daily_summary),
    }


def _extract_requested_location(message: str) -> str | None:
    patterns = [
        r"\bwhat(?:'s| is) the weather in\s+(.+)$",
        r"\bweather in\s+(.+)$",
        r"\btemperature in\s+(.+)$",
        r"\bforecast in\s+(.+)$",
        r"\bweather at\s+(.+)$",
        r"\btemperature at\s+(.+)$",
        r"\bforecast for\s+(.+)$",
        r"\bweather for\s+(.+)$",
        r"\brain in\s+(.+)$",
        r"\brain at\s+(.+)$",
        r"\bclimate in\s+(.+)$",
        r"\bclimate of\s+(.+)$",
        r"\bhow is the weather in\s+(.+)$",
        r"\bhow is the weather at\s+(.+)$",
    ]

    for pattern in patterns:
        match = re.search(
            pattern,
            message.strip(),
            re.IGNORECASE,
        )

        if match:
            location = match.group(1).strip(
                " .?!,\"'"
            )

            location = re.sub(
                r"\b(right now|today|tomorrow|now|currently|this evening|tonight)\b",
                "",
                location,
                flags=re.IGNORECASE,
            )

            location = re.sub(
                r"\s+",
                " ",
                location,
            ).strip(
                " .?!,\"'"
            )

            if location:
                return location

    return None


def _weather_description(code):
    if code is None:
        return "current conditions"

    try:
        code = int(code)
    except (TypeError, ValueError):
        return "current conditions"

    if code == 0:
        return "clear sky"

    if code in (1, 2, 3):
        return "partly cloudy to overcast conditions"

    if code in (45, 48):
        return "foggy conditions"

    if code in (51, 53, 55, 56, 57):
        return "drizzle"

    if code in (61, 63, 65, 66, 67):
        return "rain"

    if code in (71, 73, 75, 77):
        return "snow conditions"

    if code in (80, 81, 82):
        return "rain showers"

    if code in (85, 86):
        return "snow showers"

    if code in (95, 96, 99):
        return "thunderstorm conditions"

    return "current conditions"


def _local_weather_fallback(
    location_name: str | None,
    context: dict,
    language: str,
) -> str:
    """
    Fallback response used when Gemini is unavailable,
    including 429 RESOURCE_EXHAUSTED quota errors.

    Weather values come from Open-Meteo.
    No weather values are invented.
    """

    location = location_name or "your location"

    temperature = context.get("temperature")
    apparent_temperature = context.get(
        "apparent_temperature"
    )
    humidity = context.get("humidity")
    wind_speed = context.get("wind_speed")
    precipitation = context.get("precipitation")
    weather_code = context.get("weather_code")

    description = _weather_description(weather_code)

    if temperature is None:
        return (
            f"Weather data is temporarily unavailable "
            f"for {location}."
        )

    feels_text = (
        f"{apparent_temperature}°C"
        if apparent_temperature is not None
        else "N/A"
    )

    humidity_text = (
        f"{humidity}%"
        if humidity is not None
        else "N/A"
    )

    wind_text = (
        f"{wind_speed} km/h"
        if wind_speed is not None
        else "N/A"
    )

    precipitation_text = (
        f"{precipitation} mm"
        if precipitation is not None
        else "N/A"
    )

    daily_summary = context.get(
        "daily_summary",
        "",
    )

    first_day_forecast = (
        daily_summary.split("\n")[0]
        if daily_summary
        else "Forecast data unavailable."
    )

    return (
        f"Weather for {location}: "
        f"{temperature}°C, "
        f"feels like {feels_text}, "
        f"humidity {humidity_text}, "
        f"wind {wind_text}, "
        f"precipitation {precipitation_text}, "
        f"with {description}.\n\n"
        f"Today's forecast: {first_day_forecast}"
    )


async def _get_location_weather(location: str):
    geo_result = await search_location(location)

    if not geo_result:
        return None, None

    weather_data = await get_weather(
        geo_result["latitude"],
        geo_result["longitude"],
    )

    weather_context = create_weather_context(
        weather_data
    )

    return geo_result, weather_context


async def chat_with_user(
    user_id: int,
    message: str,
):
    # --------------------------------
    # 1. GET USER
    # --------------------------------

    with engine.connect() as connection:

        user_result = connection.execute(
            text(
                """
                SELECT
                    name,
                    profession,
                    language,
                    latitude,
                    longitude
                FROM users
                WHERE id = :user_id
                """
            ),
            {"user_id": user_id},
        ).mappings().first()

        if not user_result:
            raise ValueError("User not found")

        previous_profession = (
            user_result["profession"]
        )

        language = (
            user_result["language"]
            or "English"
        )

        latitude = user_result["latitude"]
        longitude = user_result["longitude"]

    # --------------------------------
    # 2. DETECT PROFESSION
    # --------------------------------
    # Gemini is optional here.
    # If Gemini quota is exhausted,
    # Chat continues normally.

    try:

        detected_profession = detect_profession(
            message=message,
            previous_profession=previous_profession,
        )

    except Exception as error:

        print(
            f"Profession detection unavailable: "
            f"{error}"
        )

        detected_profession = (
            previous_profession
            or "General User"
        )

    # --------------------------------
    # 3. GET HOME LOCATION WEATHER
    # --------------------------------

    weather_context = {}

    if (
        latitude is not None
        and longitude is not None
    ):

        try:

            weather_data = await get_weather(
                latitude,
                longitude,
            )

            weather_context = (
                create_weather_context(
                    weather_data
                )
            )

        except Exception as error:

            print(
                f"Home weather API error: "
                f"{error}"
            )

    # --------------------------------
    # 4. DETECT REQUESTED LOCATION
    # --------------------------------

    queried_location_name = None
    queried_weather_context = {}

    requested_location = (
        _extract_requested_location(message)
    )

    # --------------------------------
    # 5. GET REQUESTED LOCATION WEATHER
    # --------------------------------

    if requested_location:

        try:

            print(
                f"Location detected in chat: "
                f"{requested_location}"
            )

            geo_result, requested_context = (
                await _get_location_weather(
                    requested_location
                )
            )

            if geo_result and requested_context:

                queried_location_name = (
                    geo_result.get("city")
                    or geo_result.get("name")
                    or requested_location
                )

                queried_weather_context = (
                    requested_context
                )

                print(
                    f"Real-time weather loaded for: "
                    f"{queried_location_name}"
                )

            else:

                print(
                    f"Location not found: "
                    f"{requested_location}"
                )

        except Exception as error:

            print(
                f"Requested location weather error: "
                f"{error}"
            )

            queried_location_name = None
            queried_weather_context = {}

    # --------------------------------
    # 6. GENERATE AI RESPONSE
    # --------------------------------

    try:

        ai_response = generate_chat_response(
            user_message=message,
            profession=detected_profession,
            language=language,
            latitude=latitude,
            longitude=longitude,
            weather_context=weather_context,
            queried_location_name=(
                queried_location_name
            ),
            queried_weather_context=(
                queried_weather_context
            ),
        )

    except Exception as error:

        # --------------------------------
        # IMPORTANT:
        # Gemini 429 / 503 / quota errors
        # MUST NOT break Chat.
        # --------------------------------

        print(
            f"Gemini unavailable. "
            f"Using weather fallback: {error}"
        )

        fallback_context = (
            queried_weather_context
            or weather_context
        )

        ai_response = _local_weather_fallback(
            queried_location_name,
            fallback_context,
            language,
        )

    # --------------------------------
    # 7. SAVE PROFESSION + CHAT
    # --------------------------------

    with engine.begin() as connection:

        connection.execute(
            text(
                """
                UPDATE users
                SET
                    profession = :profession,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = :user_id
                """
            ),
            {
                "profession": detected_profession,
                "user_id": user_id,
            },
        )

        # Find latest session
        session_result = connection.execute(
            text(
                """
                SELECT id
                FROM chat_sessions
                WHERE user_id = :user_id
                ORDER BY created_at DESC
                LIMIT 1
                """
            ),
            {"user_id": user_id},
        ).mappings().first()

        if session_result:

            session_id = session_result["id"]

        else:

            session_result = connection.execute(
                text(
                    """
                    INSERT INTO chat_sessions (user_id)
                    VALUES (:user_id)
                    RETURNING id
                    """
                ),
                {"user_id": user_id},
            ).mappings().first()

            session_id = session_result["id"]

        # Save user message
        connection.execute(
            text(
                """
                INSERT INTO chat_messages
                    (session_id, role, message)
                VALUES
                    (:session_id, 'user', :message)
                """
            ),
            {
                "session_id": session_id,
                "message": message,
            },
        )

        # Save assistant response
        connection.execute(
            text(
                """
                INSERT INTO chat_messages
                    (session_id, role, message)
                VALUES
                    (:session_id, 'assistant', :message)
                """
            ),
            {
                "session_id": session_id,
                "message": ai_response,
            },
        )

    # --------------------------------
    # 8. RETURN RESPONSE
    # --------------------------------

    return {
        "response": ai_response,
        "session_id": session_id,
        "detected_profession": detected_profession,
    }