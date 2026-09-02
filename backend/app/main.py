from fastapi import FastAPI

from app.api.v1.health import router as health_router
from app.api.v1.users import router as users_router
from app.api.v1.chat import router as chat_router
from app.api.v1.weather import router as weather_router
from app.api.v1.geocoding import router as geocoding_router


app = FastAPI(
    title="WeatherGPT API",
    version="1.0.0"
)


app.include_router(
    health_router,
    prefix="/api/v1"
)

app.include_router(
    users_router,
    prefix="/api/v1"
)

app.include_router(
    chat_router,
    prefix="/api/v1"
)

app.include_router(
    weather_router,
    prefix="/api/v1"
)

app.include_router(
    geocoding_router,
    prefix="/api/v1"
)


@app.get("/")
def root():
    return {
        "message": "Welcome to WeatherGPT API"
    }