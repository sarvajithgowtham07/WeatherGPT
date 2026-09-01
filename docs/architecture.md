# WeatherGPT Architecture

## Current Architecture

React Native / Expo
        |
        | HTTP
        v
     FastAPI
        |
        | SQLAlchemy
        v
   PostgreSQL

## Infrastructure

Docker Compose manages:

- FastAPI backend
- PostgreSQL database

## Future Components

The architecture will later include:

- Weather API
- LLM
- RAG
- Maps/GIS
- Forecasting
- Alerts