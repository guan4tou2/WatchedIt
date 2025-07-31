import uuid

from sqlalchemy import JSON, Column, DateTime, String
from sqlalchemy.sql import func

from ..db.database import Base


class CloudBackup(Base):
    __tablename__ = "cloud_backups"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    device_id = Column(String, nullable=False, index=True)
    works = Column(JSON, nullable=False)  # 作品數據
    tags = Column(JSON, nullable=False)  # 標籤數據
    backup_date = Column(DateTime(timezone=True), nullable=False)
    version = Column(String, nullable=False, default="1.0.0")
    last_updated = Column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    def __repr__(self):
        return f"<CloudBackup(id={self.id}, device_id='{self.device_id}', backup_date='{self.backup_date}')>"
