from fastapi import APIRouter

from src.auth import routes as auth_routes
from src.standups import routes as standup_routes
from src.blockers import routes as blocker_routes

api_router = APIRouter()

api_router.include_router(auth_routes.router, prefix="/auth", tags=["auth"])
api_router.include_router(standup_routes.router, tags=["standups"])
api_router.include_router(blocker_routes.router, tags=["blockers"])
