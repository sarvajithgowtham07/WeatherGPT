from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware


from app.api.v1.health import router as health_router
from app.api.v1.users import router as users_router
from app.api.v1.chat import router as chat_router
from app.api.v1.weather import router as weather_router
from app.api.v1.geocoding import router as geocoding_router
from app.api.v1.voice import router as voice_router

app = FastAPI(
    title="WeatherGPT API",
    version="1.0.0"
)

# Allow the Expo app (mobile + web preview) to call this API from any
# origin/device on the network. Without this, requests made from a
# browser (Expo web) are blocked by CORS before they even reach the
# location-search / weather endpoints.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
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
app.include_router(
    voice_router,
    prefix="/api/v1"
)


@app.get("/")
def root():
    return {
        "message": "Welcome to WeatherGPT API"
    }