from beanie import Document
from pydantic import Field
from datetime import datetime
from typing import Optional

class User(Document):
    clerk_id: str = Field(unique=True)
    name: str
    email: str
    resume_url: Optional[str] = None
    streak: int = 0
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "users"
