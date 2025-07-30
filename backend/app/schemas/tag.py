from typing import Optional

from pydantic import BaseModel, Field


class TagCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=50)
    color: str = Field("#3b82f6", description="標籤顏色，十六進位色碼")


class TagUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=50)
    color: Optional[str] = Field(None, description="標籤顏色，十六進位色碼")


class TagResponse(BaseModel):
    id: int
    name: str
    color: str

    class Config:
        from_attributes = True
