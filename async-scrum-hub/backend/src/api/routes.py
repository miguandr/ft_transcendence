from fastapi import APIRouter

from src.standups import routes as standup_routes
from src.blockers import routes as blocker_routes

api_router = APIRouter()

api_router.include_router(standup_routes.router, tags=["standups"])
api_router.include_router(blocker_routes.router, tags=["blockers"])
