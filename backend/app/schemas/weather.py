from pydantic import BaseModel
from typing import Any


class WeatherResponse(BaseModel):
    latitude: float
    longitude: float
    timezone: str
    current: dict[str, Any]
    hourly: dict[str, Any]
    daily: dict[str, Any]