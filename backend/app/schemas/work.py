from datetime import datetime
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field


class WorkCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    type: str = Field(
        ..., description="作品類型：動畫、小說、漫畫、電影、電視劇、自定義"
    )
    status: str = Field(..., description="狀態：進行中、已完成、暫停、放棄")
    year: Optional[int] = Field(None, ge=1900, le=2030)
    progress: Optional[Dict[str, Any]] = Field(None, description="進度資訊")
    rating: Optional[int] = Field(None, ge=1, le=5, description="1-5星評分")
    review: Optional[str] = Field(None, max_length=1000)
    note: Optional[str] = Field(None, max_length=1000)
    source: Optional[str] = Field(None, max_length=200)
    reminder_enabled: bool = Field(False)
    reminder_frequency: Optional[str] = Field(
        None, description="daily, weekly, monthly"
    )
    tag_ids: Optional[List[int]] = Field(None, description="標籤ID列表")


class WorkUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    type: Optional[str] = Field(None)
    status: Optional[str] = Field(None)
    year: Optional[int] = Field(None, ge=1900, le=2030)
    progress: Optional[Dict[str, Any]] = Field(None)
    rating: Optional[int] = Field(None, ge=1, le=5)
    review: Optional[str] = Field(None, max_length=1000)
    note: Optional[str] = Field(None, max_length=1000)
    source: Optional[str] = Field(None, max_length=200)
    reminder_enabled: Optional[bool] = Field(None)
    reminder_frequency: Optional[str] = Field(None)
    tag_ids: Optional[List[int]] = Field(None)


class TagResponse(BaseModel):
    id: int
    name: str
    color: str

    class Config:
        from_attributes = True


class WorkResponse(BaseModel):
    id: str
    title: str
    type: str
    status: str
    year: Optional[int]
    progress: Optional[Dict[str, Any]]
    date_added: datetime
    date_updated: Optional[datetime]
    rating: Optional[int]
    review: Optional[str]
    note: Optional[str]
    source: Optional[str]
    reminder_enabled: bool
    reminder_frequency: Optional[str]
    tags: List[TagResponse] = []

    class Config:
        from_attributes = True


class WorkList(BaseModel):
    works: List[WorkResponse]
    total: int
    page: int
    size: int
