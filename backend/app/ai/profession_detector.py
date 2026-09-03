from app.ai.llm import generate_response


VALID_PROFESSIONS = {
    "Farmer",
    "Traveler",
    "Researcher",
    "Disaster Management",
    "General User"
}


def detect_profession(message: str, previous_profession: str | None = None) -> str:

    prompt = f"""
You are a profession detection system for WeatherGPT.

Your task is to infer the user's likely profession or professional context
from the user's message.

Allowed categories:

1. Farmer
2. Traveler
3. Researcher
4. Disaster Management
5. General User

Previous detected profession:
{previous_profession or "None"}

User message:
{message}

Rules:

- Analyze the meaning and context of the message.
- Do not require the user to explicitly state their profession.
- Farming, crops, irrigation, pesticides, sowing, harvesting, soil,
  agricultural activities -> Farmer.
- Travel, tourism, trips, flights, road journeys, outdoor travel,
  destinations -> Traveler.
- Scientific studies, climate studies, weather research, meteorological
  analysis, datasets, experiments -> Researcher.
- Emergency response, evacuation, cyclone response, flood response,
  disaster preparedness, rescue operations -> Disaster Management.
- If there is not enough evidence for any professional category,
  choose General User.
- Do not invent a profession.
- Return ONLY one of these exact values:

Farmer
Traveler
Researcher
Disaster Management
General User
"""

    result = generate_response(prompt).strip()

    for profession in VALID_PROFESSIONS:
        if profession.lower() in result.lower():
            return profession

    return "General User"