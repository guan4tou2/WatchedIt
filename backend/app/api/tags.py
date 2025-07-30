from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..db.database import get_db
from ..schemas.tag import TagCreate, TagResponse, TagUpdate
from ..services.tag_service import TagService

router = APIRouter(prefix="/tags", tags=["tags"])


@router.post("/", response_model=TagResponse)
async def create_tag(tag: TagCreate, db: Session = Depends(get_db)):
    """建立新標籤"""
    tag_service = TagService(db)
    return tag_service.create_tag(tag)


@router.get("/", response_model=List[TagResponse])
async def get_tags(db: Session = Depends(get_db)):
    """取得所有標籤"""
    tag_service = TagService(db)
    return tag_service.get_tags()


@router.get("/{tag_id}", response_model=TagResponse)
async def get_tag(tag_id: int, db: Session = Depends(get_db)):
    """取得單一標籤"""
    tag_service = TagService(db)
    tag = tag_service.get_tag(tag_id)
    if not tag:
        raise HTTPException(status_code=404, detail="標籤不存在")
    return tag


@router.put("/{tag_id}", response_model=TagResponse)
async def update_tag(tag_id: int, tag: TagUpdate, db: Session = Depends(get_db)):
    """更新標籤"""
    tag_service = TagService(db)
    updated_tag = tag_service.update_tag(tag_id, tag)
    if not updated_tag:
        raise HTTPException(status_code=404, detail="標籤不存在")
    return updated_tag


@router.delete("/{tag_id}")
async def delete_tag(tag_id: int, db: Session = Depends(get_db)):
    """刪除標籤"""
    tag_service = TagService(db)
    success = tag_service.delete_tag(tag_id)
    if not success:
        raise HTTPException(status_code=404, detail="標籤不存在")
    return {"message": "標籤已刪除"}
