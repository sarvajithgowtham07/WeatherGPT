# WeatherGPT 🌦️🤖

WeatherGPT is an AI-powered weather assistant designed as a mobile application.

## Technology Stack

- React Native
- Expo
- TypeScript
- FastAPI
- PostgreSQL
- Docker
- Docker Compose

## Current Architecture

Mobile App
    |
    | HTTP
    v
FastAPI
    |
    v
PostgreSQL

## Project Structure
WeatherGPT/
├── mobile/
├── backend/
├── database/
├── ai/
├── docs/
├── infra/
├── docker-compose.yml
├── .env.example
├── .gitignore
└── README.md


I AM ADDING DAY 2 README HERE

* **Mobile:** React Native, Expo, TypeScript
* **Backend:** FastAPI, Python, SQLAlchemy
* **Database:** PostgreSQL + Docker
* **APIs:** Open-Meteo (weather), Nominatim (location), Google Maps (map)
* **AI:** Gemini — planned for chat/AI features

## 📁 Important Files
* backend/app/api/v1/weather.py — Weather API route
* backend/app/services/weather_service.py — Open-Meteo integration
* backend/app/api/v1/geocoding.py — Location API
* backend/app/services/geocoding_service.py — Nominatim integration
* backend/app/schemas/weather.py — Weather schemas
* mobile/src/api/api.ts— Backend API calls
* mobile/src/api/weather.ts — Weather TypeScript types
* mobile/src/app/index.tsx — Main weather screen
* mobile/src/components/HourlyWeatherCard.tsx — Hourly forecast
* mobile/src/components/ForecastCard.tsx — 7-day forecast
* mobile/src/components/WeatherMap.tsx — Map component

## ▶️ Important Commands
bash
docker compose up -d
docker compose ps
docker compose logs backend
cd mobile
npm install
npx expo start

## 🔌 Main APIs

GET /api/v1/health
GET /api/v1/weather/?latitude={lat}&longitude={lon}
GET /api/v1/location/search

Swagger: http://localhost:8000/docs
