from beanie import Document
from typing import List, Optional

class Question(Document):
    text: str
    category: str
    difficulty: str
    role_tags: List[str] = []
    source: str # "ai" or "manual"
    ideal_answer: Optional[str] = None

    class Settings:
        name = "questions"
