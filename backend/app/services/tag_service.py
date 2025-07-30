from typing import List, Optional

from sqlalchemy.orm import Session

from ..models.tag import Tag
from ..schemas.tag import TagCreate, TagResponse, TagUpdate


class TagService:
    def __init__(self, db: Session):
        self.db = db

    def create_tag(self, tag_data: TagCreate) -> TagResponse:
        """建立新標籤"""
        tag = Tag(name=tag_data.name, color=tag_data.color)

        self.db.add(tag)
        self.db.commit()
        self.db.refresh(tag)

        return TagResponse(id=tag.id, name=tag.name, color=tag.color)

    def get_tags(self) -> List[TagResponse]:
        """取得所有標籤"""
        tags = self.db.query(Tag).order_by(Tag.name).all()

        return [TagResponse(id=tag.id, name=tag.name, color=tag.color) for tag in tags]

    def get_tag(self, tag_id: int) -> Optional[TagResponse]:
        """取得單一標籤"""
        tag = self.db.query(Tag).filter(Tag.id == tag_id).first()

        if tag:
            return TagResponse(id=tag.id, name=tag.name, color=tag.color)
        return None

    def update_tag(self, tag_id: int, tag_data: TagUpdate) -> Optional[TagResponse]:
        """更新標籤"""
        tag = self.db.query(Tag).filter(Tag.id == tag_id).first()

        if not tag:
            return None

        # 更新欄位
        update_data = tag_data.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(tag, field, value)

        self.db.commit()
        self.db.refresh(tag)

        return TagResponse(id=tag.id, name=tag.name, color=tag.color)

    def delete_tag(self, tag_id: int) -> bool:
        """刪除標籤"""
        tag = self.db.query(Tag).filter(Tag.id == tag_id).first()

        if not tag:
            return False

        self.db.delete(tag)
        self.db.commit()

        return True
