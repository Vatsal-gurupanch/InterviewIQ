from fastapi import APIRouter, Depends, HTTPException, Body
from app.api.dependencies.auth import get_current_user
from app.services import gemini_service, nlp_service
from app.models.session import Session
from app.models.user import User

router = APIRouter()

@router.post("/start")
async def start_session(
    role: str = Body(...),
    mode: str = Body(...),
    resume_text: str = Body(default=""),
    token: str = Depends(get_current_user)
):
    # In a real system, you map token to user_id. Here we use a dummy user or just skip link if user is complex.
    # For simplicity, we'll create the session without user linking or create a dummy user.
    # To keep it robust, we won't strictly enforce user_id link for now if not populated.
    
    question_data = gemini_service.generate_question(role=role, mode=mode, resume_text=resume_text, history=[])
    
    session = Session(
        user_id=None, # Skipping user link for now to prevent FK errors
        role=role,
        mode=mode,
        questions=[question_data.get("question", "Tell me about yourself.")],
        answers=[],
        scores=[],
    )
    await session.insert()
    
    return {
        "status": "success",
        "session_id": str(session.id),
        "question": session.questions[0]
    }

@router.post("/evaluate")
async def evaluate_answer(
    session_id: str = Body(...),
    user_answer: str = Body(...),
    token: str = Depends(get_current_user)
):
    session = await Session.get(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
        
    current_question = session.questions[-1]
    nlp_metrics = nlp_service.run_nlp_pipeline(answer=user_answer, ideal_answer="")
    
    evaluation = gemini_service.evaluate_answer(
        question=current_question,
        user_answer=user_answer,
        nlp_metrics=nlp_metrics
    )
    
    session.answers.append(user_answer)
    session.scores.append(evaluation.get("overall", 0))
    
    is_complete = len(session.questions) >= 5
    next_question = None
    
    if not is_complete:
        history = [{"q": q, "a": a} for q, a in zip(session.questions, session.answers)]
        q_data = gemini_service.generate_question(role=session.role, mode=session.mode, history=history)
        next_question = q_data.get("question", "What is your greatest strength?")
        session.questions.append(next_question)
        
    await session.save()
    
    return {
        "nlp_metrics": nlp_metrics,
        "evaluation": evaluation,
        "next_question": next_question,
        "is_complete": is_complete,
        "session": session.model_dump()
    }

