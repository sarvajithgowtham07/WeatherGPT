import httpx


GEOCODING_URL = "https://nominatim.openstreetmap.org/search"


async def search_location(location: str):

    params = {
        "q": location,
        "format": "json",
        "limit": 5,
        "addressdetails": 1,
    }

    headers = {
        "User-Agent": "WeatherGPT/1.0"
    }

    async with httpx.AsyncClient() as client:

        response = await client.get(
            GEOCODING_URL,
            params=params,
            headers=headers,
            timeout=10.0,
        )

        response.raise_for_status()

        results = response.json()

        if not results:
            return None

        result = results[0]

        address = result.get("address", {})

        return {
            "name": result.get("display_name"),
            "latitude": float(result["lat"]),
            "longitude": float(result["lon"]),
            "country": address.get("country"),
            "country_code": address.get("country_code"),
            "state": address.get("state"),
            "district": (
                address.get("state_district")
                or address.get("district")
                or address.get("county")
            ),
            "city": (
                address.get("city")
                or address.get("town")
                or address.get("village")
                or address.get("municipality")
            ),
            "raw_address": address,
        }