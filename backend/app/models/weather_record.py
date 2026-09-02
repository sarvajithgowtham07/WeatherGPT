from sqlalchemy import Column, Integer, Float, String, DateTime
from datetime import datetime

from app.db.database import Base


class WeatherRecord(Base):
    __tablename__ = "weather_records"

    id = Column(Integer, primary_key=True, index=True)

    latitude = Column(Float, nullable=False)

    longitude = Column(Float, nullable=False)

    temperature = Column(Float, nullable=True)

    humidity = Column(Float, nullable=True)

    wind_speed = Column(Float, nullable=True)

    rain_probability = Column(Float, nullable=True)

    weather_condition = Column(
        String(100),
        nullable=True
    )

    recorded_at = Column(
        DateTime,
        default=datetime.utcnow
    )