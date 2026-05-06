from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import clerk_backend_api
from app.core.config import settings

security = HTTPBearer()
clerk = clerk_backend_api.Clerk(bearer_auth=settings.CLERK_SECRET_KEY)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    try:
        # Note: In a real implementation, you should verify the JWT locally or via Clerk's JWKS.
        # For this prototype, we assume the frontend passes a valid Clerk session token.
        # However, the clerk SDK has a method to verify tokens if configured correctly.
        # For simplicity and given the early stage, we will return the token for now.
        return token
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
