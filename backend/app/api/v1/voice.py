from fastapi import APIRouter, UploadFile, File, HTTPException
from google.genai import types

from app.ai.llm import client

router = APIRouter(prefix="/voice", tags=["Voice"])


@router.post("/transcribe")
async def transcribe_audio(file: UploadFile = File(...)):
    try:
        audio_data = await file.read()

        if not audio_data:
            raise HTTPException(
                status_code=400,
                detail="Audio file is empty"
            )

        mime_type = file.content_type or "audio/m4a"

        response = client.models.generate_content(
            model="gemini-3.5-flash",
            contents=[
                types.Part.from_bytes(
                    data=audio_data,
                    mime_type=mime_type
                ),
                """
Transcribe the user's speech exactly.

Return ONLY the transcribed text.
Do not add explanations.
Do not answer the user's question.
Do not add quotation marks.
"""
            ]
        )

        if not response.text:
            raise HTTPException(
                status_code=500,
                detail="Gemini returned an empty transcription"
            )

        return {
            "text": response.text.strip()
        }

    except HTTPException:
        raise

    except Exception as error:
        print("Voice transcription error:", error)

        raise HTTPException(
            status_code=500,
            detail=f"Voice transcription failed: {str(error)}"
        )