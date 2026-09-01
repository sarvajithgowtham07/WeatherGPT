from fastapi import FastAPI
from app.api.v1.health import router as health_router

app = FastAPI(
    title="WeatherGPT API",
    version="1.0.0"
)

app.include_router(
    health_router,
    prefix="/api/v1"
)


@app.get("/")
def root():
    return {
        "message": "Welcome to WeatherGPT API"
    }