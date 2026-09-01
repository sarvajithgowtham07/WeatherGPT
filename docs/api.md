# WeatherGPT API

## Health

GET /api/v1/health

Response:

{
  "status": "ok",
  "service": "WeatherGPT"
}

## Database Health

GET /api/v1/db-health

Response:

{
  "status": "ok",
  "database": "PostgreSQL"
}