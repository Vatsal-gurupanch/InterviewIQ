from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie

from app.core.config import settings

from app.models.user import User
from app.models.session import Session
from app.models.question import Question
from app.models.feedback import Feedback

async def init_db():
    client = AsyncIOMotorClient(settings.MONGODB_URI)
    
    # Initialize Beanie with the client and document models
    await init_beanie(database=client.ipc, document_models=[
        User, Session, Question, Feedback
    ])
    
    print("MongoDB successfully initialized")
