from sqlalchemy import Column, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from ..db.database import Base


class Tag(Base):
    __tablename__ = "tags"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String, unique=True, nullable=False, index=True)
    color = Column(String, default="#3b82f6")  # 預設藍色

    # 關聯作品
    works = relationship("WorkTag", back_populates="tag")

    def __repr__(self):
        return f"<Tag(id={self.id}, name='{self.name}')>"


class WorkTag(Base):
    __tablename__ = "work_tags"

    work_id = Column(String, ForeignKey("works.id"), primary_key=True)
    tag_id = Column(Integer, ForeignKey("tags.id"), primary_key=True)

    # 關聯
    work = relationship("Work", back_populates="tags")
    tag = relationship("Tag", back_populates="works")

    def __repr__(self):
        return f"<WorkTag(work_id={self.work_id}, tag_id={self.tag_id})>"
