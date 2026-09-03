from google import genai
from app.config import GEMINI_API_KEY
import time


if not GEMINI_API_KEY:
    raise ValueError("GEMINI_API_KEY is not set in the .env file")


client = genai.Client(
    api_key=GEMINI_API_KEY
)


def generate_response(prompt: str) -> str:
    last_error = None

    for attempt in range(3):
        try:
            response = client.models.generate_content(
                model="gemini-3.5-flash",
                contents=prompt
            )

            if response.text:
                return response.text

            raise RuntimeError(
                "Gemini returned an empty response"
            )

        except Exception as error:
            last_error = error

            if attempt < 2:
                time.sleep(2)

    raise RuntimeError(
        f"Gemini request failed after 3 attempts: {last_error}"
    )