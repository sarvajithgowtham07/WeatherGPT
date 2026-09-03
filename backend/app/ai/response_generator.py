from app.ai.llm import generate_response
from app.ai.prompts import build_chat_prompt


def generate_chat_response(
    user_message: str,
    profession: str,
    language: str,
    latitude: float | None,
    longitude: float | None,
    weather_context: dict
) -> str:

    prompt = build_chat_prompt(
        user_message=user_message,
        profession=profession,
        language=language,
        latitude=latitude,
        longitude=longitude,
        weather_context=weather_context
    )

    return generate_response(prompt)