import uuid

from sqlalchemy import JSON, Boolean, Column, DateTime, Integer, String
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from ..db.database import Base


class Work(Base):
    __tablename__ = "works"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    title = Column(String, nullable=False, index=True)
    type = Column(String, nullable=False)  # 動畫、小說、漫畫、電影、電視劇、自定義
    status = Column(String, nullable=False)  # 進行中、已完結、暫停、放棄
    year = Column(Integer)
    progress = Column(JSON)  # 進度資訊，如集數、總集數等
    date_added = Column(DateTime(timezone=True), server_default=func.now())
    date_updated = Column(DateTime(timezone=True), onupdate=func.now())
    rating = Column(Integer)  # 1-5 星評分
    review = Column(String)  # 短評
    note = Column(String)  # 備註
    source = Column(String)  # 來源
    reminder_enabled = Column(Boolean, default=False)
    reminder_frequency = Column(String)  # daily, weekly, monthly

    # 關聯標籤
    tags = relationship("WorkTag", back_populates="work")

    def __repr__(self):
        return f"<Work(id={self.id}, title='{self.title}', type='{self.type}')>"
