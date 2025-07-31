from datetime import datetime
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from ..db.init_db import get_db
from ..models import CloudBackup

router = APIRouter()


class BackupData(BaseModel):
    works: List[dict]
    tags: List[dict]
    backupDate: str
    version: str
    deviceId: str


class HealthResponse(BaseModel):
    status: str
    timestamp: str


@router.get("/health")
async def health_check():
    """健康檢查端點"""
    return HealthResponse(status="ok", timestamp=datetime.now().isoformat())


@router.post("/backup")
async def upload_backup(data: BackupData, db: Session = Depends(get_db)):
    """上傳備份數據"""
    try:
        # 檢查是否已存在該設備的備份
        existing_backup = (
            db.query(CloudBackup).filter(CloudBackup.device_id == data.deviceId).first()
        )

        if existing_backup:
            # 更新現有備份
            existing_backup.works = data.works
            existing_backup.tags = data.tags
            existing_backup.backup_date = datetime.fromisoformat(
                data.backupDate.replace("Z", "+00:00")
            )
            existing_backup.version = data.version
            existing_backup.last_updated = datetime.now()
        else:
            # 創建新備份
            backup = CloudBackup(
                device_id=data.deviceId,
                works=data.works,
                tags=data.tags,
                backup_date=datetime.fromisoformat(
                    data.backupDate.replace("Z", "+00:00")
                ),
                version=data.version,
            )
            db.add(backup)

        db.commit()

        return {
            "success": True,
            "message": "備份上傳成功",
            "works": data.works,
            "tags": data.tags,
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"上傳失敗: {str(e)}")


@router.get("/backup")
async def download_backup(
    device_id: Optional[str] = None, db: Session = Depends(get_db)
):
    """下載備份數據"""
    try:
        if device_id:
            # 查找指定設備的備份
            backup = (
                db.query(CloudBackup).filter(CloudBackup.device_id == device_id).first()
            )

            if backup:
                return {
                    "works": backup.works,
                    "tags": backup.tags,
                    "backupDate": backup.backup_date.isoformat(),
                    "version": backup.version,
                    "lastUpdated": backup.last_updated.isoformat(),
                }

        # 如果沒有指定設備 ID 或找不到數據，返回空數據
        return {
            "works": [],
            "tags": [],
            "backupDate": datetime.now().isoformat(),
            "version": "1.0.0",
            "lastUpdated": datetime.now().isoformat(),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"下載失敗: {str(e)}")


@router.delete("/backup")
async def delete_backup(device_id: str, db: Session = Depends(get_db)):
    """刪除備份數據"""
    try:
        backup = (
            db.query(CloudBackup).filter(CloudBackup.device_id == device_id).first()
        )

        if backup:
            db.delete(backup)
            db.commit()
            return {"success": True, "message": "備份刪除成功"}
        else:
            return {"success": False, "message": "找不到指定的備份數據"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"刪除失敗: {str(e)}")


@router.get("/backups")
async def list_backups(db: Session = Depends(get_db)):
    """列出所有備份"""
    try:
        backups = db.query(CloudBackup).all()
        return {
            "backups": [
                {
                    "device_id": backup.device_id,
                    "backup_date": backup.backup_date.isoformat(),
                    "version": backup.version,
                    "last_updated": backup.last_updated.isoformat(),
                }
                for backup in backups
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"查詢失敗: {str(e)}")
