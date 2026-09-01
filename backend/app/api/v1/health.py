from fastapi import APIRouter
from app.db.database import test_database_connection

router = APIRouter()


@router.get("/health")
def health_check():
    return {
        "status": "ok",
        "service": "WeatherGPT"
    }


@router.get("/db-health")
def database_health_check():
    try:
        test_database_connection()

        return {
            "status": "ok",
            "database": "PostgreSQL"
        }

    except Exception as e:
        return {
            "status": "error",
            "database": "PostgreSQL",
            "message": str(e)
        }