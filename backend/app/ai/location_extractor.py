from app.ai.llm import generate_response


EXTRACTION_PROMPT_TEMPLATE = """
You are a location extraction assistant for a weather chatbot.

Read the user's message below and determine if they are asking about the
weather for a SPECIFIC place (a city, town, region, or country) other than
just "here", "my location", or no place at all.

User message:
{message}

Rules:
1. If the user mentions a specific place name, reply with ONLY that place
   name, exactly as it should be searched on a map (e.g. "Mumbai, India").
2. If the user does NOT mention any specific place (e.g. they just say
   "hello", "what's the weather", "is it going to rain today", or refer to
   "here"/"my location"), reply with exactly: NONE
3. Do not explain. Do not add punctuation. Reply with the place name or
   NONE, and nothing else.
"""


def extract_location(message: str) -> str | None:
    """
    Best-effort extraction of a place name from a user's chat message.
    Returns None (never raises) if extraction fails or no place is found,
    so a hiccup here never breaks the main chat response.
    """

    prompt = EXTRACTION_PROMPT_TEMPLATE.format(
        message=message
    )

    try:
        result = generate_response(prompt).strip()
    except Exception as error:
        print(
            f"Location extraction error: {error}"
        )
        return None

    if not result or result.upper() == "NONE":
        return None

    return result
