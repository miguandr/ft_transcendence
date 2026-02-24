from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from src.database import get_db
from src.analytics import service
from src.analytics.schemas import AnalyticsResponse

router = APIRouter()

@router.get(
	"/organizations/{org_id}/analytics", 
	response_model=AnalyticsResponse, 
	status_code=status.HTTP_200_OK
)
def analytics(db: Session = Depends(get_db)):
	return service.get_analytics()
