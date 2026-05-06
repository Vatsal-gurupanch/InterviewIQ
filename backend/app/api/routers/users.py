from fastapi import APIRouter, Depends, HTTPException, Body
from app.api.dependencies.auth import get_current_user
from app.models.user import User

router = APIRouter()

@router.get("/me")
async def get_my_profile(token: str = Depends(get_current_user)):
    # In a complete implementation, use the clerk token to identify the user
    # user = await User.find_one(User.clerk_id == token)
    # if not user:
    #     raise HTTPException(status_code=404, detail="User not found")
    # return user
    return {"message": "User profile endpoint", "token": token}

@router.post("/resume")
async def update_resume(resume_url: str = Body(...), token: str = Depends(get_current_user)):
    # user = await User.find_one(User.clerk_id == token)
    # user.resume_url = resume_url
    # await user.save()
    return {"message": "Resume updated successfully"}
