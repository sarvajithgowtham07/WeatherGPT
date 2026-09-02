from pydantic import BaseModel


class UserCreate(BaseModel):
    name: str | None = None
    profession: str | None = None
    language: str | None = None
    latitude: float | None = None
    longitude: float | None = None