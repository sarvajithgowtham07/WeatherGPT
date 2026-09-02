from fastapi import APIRouter, Query

from app.services.weather_service import get_weather
from app.schemas.weather import WeatherResponse


router = APIRouter(
    prefix="/weather",
    tags=["Weather"]
)


@router.get("/", response_model=WeatherResponse)
async def weather(
    latitude: float = Query(..., description="Latitude of the location"),
    longitude: float = Query(..., description="Longitude of the location"),
):
    return await get_weather(latitude, longitude)