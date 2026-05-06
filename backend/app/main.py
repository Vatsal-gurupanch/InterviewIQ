from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.core.config import settings
from app.core.database import init_db

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Initialize DB
    await init_db()
    # Startup: Initialize NLP singletons (could be imported here to trigger load)
    from app.services import nlp_service # This will load spacy model etc.
    print("NLP Services loaded.")
    yield
    # Shutdown
    print("Shutting down...")

app = FastAPI(
    title="AI Interview Coach API",
    description="Backend for AI Interview Coach",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL, "http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from app.api.routers import interviews, users

app.include_router(interviews.router, prefix="/api/interviews", tags=["interviews"])
app.include_router(users.router, prefix="/api/users", tags=["users"])

@app.get("/")
async def root():
    return {"message": "Welcome to the AI Interview Coach API"}
