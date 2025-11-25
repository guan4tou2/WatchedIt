from datetime import datetime
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field, validator


class WorkCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    type: str = Field(
        ..., description="作品類型：動畫、小說、漫畫、電影、電視劇、自定義"
    )
    status: str = Field(..., description="狀態：進行中、已完結、暫停、放棄")
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

    @validator("title")
    def title_not_empty(cls, v):
        """Validate title is not empty or whitespace only."""
        if not v or not v.strip():
            raise ValueError("Title cannot be empty")
        return v.strip()

    @validator("status")
    def validate_status(cls, v):
        """Validate status is one of the allowed values."""
        valid_statuses = ["進行中", "已完結", "暫停", "放棄"]
        if v not in valid_statuses:
            raise ValueError(
                f"Invalid status: {v}. Must be one of: {', '.join(valid_statuses)}"
            )
        return v

    @validator("reminder_frequency")
    def validate_reminder_frequency(cls, v, values):
        """Validate reminder frequency when reminder is enabled."""
        if values.get("reminder_enabled") and not v:
            raise ValueError("Reminder frequency is required when reminder is enabled")
        if v and v not in ["daily", "weekly", "monthly"]:
            raise ValueError("Reminder frequency must be daily, weekly, or monthly")
        return v

    class Config:
        schema_extra = {
            "example": {
                "title": "鬼滅之刃",
                "type": "動畫",
                "status": "已完結",
                "year": 2019,
                "rating": 5,
                "review": "畫面優美，故事精彩",
                "tag_ids": [1, 2],
            }
        }



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
