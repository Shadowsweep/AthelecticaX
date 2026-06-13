from fastapi import APIRouter
from .endpoints import auth, approval, attendance

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["authentication"])
api_router.include_router(approval.router, prefix="/approval", tags=["approval"])
api_router.include_router(attendance.router, prefix="/attendance", tags=["attendance"])
