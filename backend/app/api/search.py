from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from ..db.database import get_db
from ..services.search_service import SearchService

router = APIRouter(prefix="/search", tags=["search"])


@router.get("/anime")
async def search_anime(
    query: str = Query(..., description="搜尋關鍵字"), db: Session = Depends(get_db)
):
    """搜尋動畫（整合 AniList API）"""
    search_service = SearchService(db)
    return search_service.search_anime(query)


@router.get("/suggestions")
async def get_suggestions(
    query: str = Query(..., description="搜尋關鍵字"), db: Session = Depends(get_db)
):
    """取得搜尋建議"""
    search_service = SearchService(db)
    return search_service.get_suggestions(query)
