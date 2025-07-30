from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from ..db.database import get_db
from ..schemas.work import WorkCreate, WorkList, WorkResponse, WorkUpdate
from ..services.work_service import WorkService

router = APIRouter(prefix="/works", tags=["works"])


@router.post("/", response_model=WorkResponse)
async def create_work(work: WorkCreate, db: Session = Depends(get_db)):
    """建立新作品"""
    work_service = WorkService(db)
    return work_service.create_work(work)


@router.get("/", response_model=WorkList)
async def get_works(
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    title: Optional[str] = Query(None),
    type: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    year: Optional[int] = Query(None),
    tag_ids: Optional[List[int]] = Query(None),
    db: Session = Depends(get_db),
):
    """取得作品列表，支援篩選"""
    work_service = WorkService(db)
    return work_service.get_works(
        page=page,
        size=size,
        title=title,
        type=type,
        status=status,
        year=year,
        tag_ids=tag_ids,
    )


@router.get("/{work_id}", response_model=WorkResponse)
async def get_work(work_id: str, db: Session = Depends(get_db)):
    """取得單一作品"""
    work_service = WorkService(db)
    work = work_service.get_work(work_id)
    if not work:
        raise HTTPException(status_code=404, detail="作品不存在")
    return work


@router.put("/{work_id}", response_model=WorkResponse)
async def update_work(work_id: str, work: WorkUpdate, db: Session = Depends(get_db)):
    """更新作品"""
    work_service = WorkService(db)
    updated_work = work_service.update_work(work_id, work)
    if not updated_work:
        raise HTTPException(status_code=404, detail="作品不存在")
    return updated_work


@router.delete("/{work_id}")
async def delete_work(work_id: str, db: Session = Depends(get_db)):
    """刪除作品"""
    work_service = WorkService(db)
    success = work_service.delete_work(work_id)
    if not success:
        raise HTTPException(status_code=404, detail="作品不存在")
    return {"message": "作品已刪除"}


@router.get("/stats/overview")
async def get_stats(db: Session = Depends(get_db)):
    """取得統計資訊"""
    work_service = WorkService(db)
    return work_service.get_stats()
