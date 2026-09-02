from fastapi import APIRouter, Query

from app.services.geocoding_service import search_location


router = APIRouter(
    prefix="/location",
    tags=["Location"]
)


@router.get("/search")
async def location_search(
    name: str = Query(..., description="Location name to search")
):
    result = await search_location(name)

    if result is None:
        return {
            "message": "Location not found"
        }

    return result