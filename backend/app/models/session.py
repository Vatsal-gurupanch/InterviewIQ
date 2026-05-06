from beanie import Document, Link
from pydantic import Field
from datetime import datetime
from typing import List, Optional
from app.models.user import User

class Session(Document):
    user_id: Optional[Link[User]] = None
    role: str
    mode: str # e.g. "behavioral", "technical", "mixed"
    questions: List[str] = []
    answers: List[str] = []
    scores: List[float] = []
    duration: Optional[int] = None # in seconds
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "sessions"
