from beanie import Document, Link
from pydantic import Field
from typing import List, Dict, Any
from app.models.session import Session
from app.models.question import Question

class Feedback(Document):
    session_id: Link[Session]
    question_id: Link[Question]
    answer: str
    score: float = Field(ge=0, le=10)
    strengths: List[str] = []
    improvements: List[str] = []
    nlp_metrics: Dict[str, Any] = {}

    class Settings:
        name = "feedback"
