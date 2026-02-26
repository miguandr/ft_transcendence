from fastapi import APIRouter

from src.auth import routes as auth_routes
from src.users import routes as user_routes
from src.standups import routes as standup_routes
from src.blockers import routes as blocker_routes
from src.legal import routes as legal_routes
from src.analytics import routes as analytics_routes

api_router = APIRouter()

api_router.include_router(auth_routes.router, prefix="/auth", tags=["auth"])
api_router.include_router(user_routes.router, tags=["users"])
api_router.include_router(standup_routes.router, tags=["standups"])
api_router.include_router(blocker_routes.router, tags=["blockers"])
api_router.include_router(legal_routes.router, tags=["legal"])
api_router.include_router(analytics_routes.router, tags=["analytics"])

