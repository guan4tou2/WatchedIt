from typing import Any, Dict, List, Optional

from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError

from ..models.tag import Tag, WorkTag
from ..models.work import Work
from ..schemas.work import WorkCreate, WorkList, WorkResponse, WorkUpdate
from ..exceptions import (
    WorkNotFoundException,
    TagNotFoundException,
    DatabaseException,
)
from ..utils.logger import logger


class WorkService:
    def __init__(self, db: Session):
        self.db = db

    def create_work(self, work_data: WorkCreate) -> WorkResponse:
        """建立新作品"""
        logger.info(f"Creating work: {work_data.title}")
        
        try:
            # 建立作品
            work = Work(
                title=work_data.title,
                type=work_data.type,
                status=work_data.status,
                year=work_data.year,
                progress=work_data.progress,
                rating=work_data.rating,
                review=work_data.review,
                note=work_data.note,
                source=work_data.source,
                reminder_enabled=work_data.reminder_enabled,
                reminder_frequency=work_data.reminder_frequency,
            )

            self.db.add(work)
            self.db.commit()
            self.db.refresh(work)

            # 處理標籤關聯
            if work_data.tag_ids:
                for tag_id in work_data.tag_ids:
                    # 驗證標籤是否存在
                    tag = self.db.query(Tag).filter(Tag.id == tag_id).first()
                    if not tag:
                        logger.warning(f"Tag {tag_id} not found, skipping")
                        continue
                    
                    work_tag = WorkTag(work_id=work.id, tag_id=tag_id)
                    self.db.add(work_tag)
                self.db.commit()

            logger.info(f"Work created successfully: {work.id}")
            return self._work_to_response(work)
            
        except SQLAlchemyError as e:
            logger.error(f"Database error creating work: {str(e)}")
            self.db.rollback()
            raise DatabaseException(f"Failed to create work: {str(e)}")

    def get_works(
        self,
        page: int = 1,
        size: int = 20,
        title: Optional[str] = None,
        type: Optional[str] = None,
        status: Optional[str] = None,
        year: Optional[int] = None,
        tag_ids: Optional[List[int]] = None,
    ) -> WorkList:
        """取得作品列表"""
        query = self.db.query(Work)

        # 篩選條件
        if title:
            query = query.filter(Work.title.ilike(f"%{title}%"))
        if type:
            query = query.filter(Work.type == type)
        if status:
            query = query.filter(Work.status == status)
        if year:
            query = query.filter(Work.year == year)
        if tag_ids:
            query = query.join(WorkTag).filter(WorkTag.tag_id.in_(tag_ids))

        # 計算總數
        total = query.count()

        # 分頁
        offset = (page - 1) * size
        works = query.offset(offset).limit(size).all()

        # 轉換為回應格式
        work_responses = [self._work_to_response(work) for work in works]

        return WorkList(works=work_responses, total=total, page=page, size=size)

    def get_work(self, work_id: str) -> Optional[WorkResponse]:
        """取得單一作品"""
        logger.debug(f"Fetching work: {work_id}")
        
        work = self.db.query(Work).filter(Work.id == work_id).first()
        if not work:
            logger.warning(f"Work not found: {work_id}")
            raise WorkNotFoundException(work_id)
        
        return self._work_to_response(work)

    def update_work(
        self, work_id: str, work_data: WorkUpdate
    ) -> Optional[WorkResponse]:
        """更新作品"""
        work = self.db.query(Work).filter(Work.id == work_id).first()
        if not work:
            return None

        # 更新欄位
        update_data = work_data.dict(exclude_unset=True)
        tag_ids = update_data.pop("tag_ids", None)

        for field, value in update_data.items():
            setattr(work, field, value)

        # 處理標籤更新
        if tag_ids is not None:
            # 刪除現有標籤關聯
            self.db.query(WorkTag).filter(WorkTag.work_id == work_id).delete()

            # 新增標籤關聯
            for tag_id in tag_ids:
                work_tag = WorkTag(work_id=work_id, tag_id=tag_id)
                self.db.add(work_tag)

        self.db.commit()
        self.db.refresh(work)

        return self._work_to_response(work)

    def delete_work(self, work_id: str) -> bool:
        """刪除作品"""
        work = self.db.query(Work).filter(Work.id == work_id).first()
        if not work:
            return False

        # 刪除標籤關聯
        self.db.query(WorkTag).filter(WorkTag.work_id == work_id).delete()

        # 刪除作品
        self.db.delete(work)
        self.db.commit()

        return True

    def get_stats(self) -> Dict[str, Any]:
        """取得統計資訊"""
        from sqlalchemy import func

        total_works = self.db.query(Work).count()

        # 按類型統計
        type_stats = (
            self.db.query(Work.type, func.count(Work.id)).group_by(Work.type).all()
        )

        # 按狀態統計
        status_stats = (
            self.db.query(Work.status, func.count(Work.id)).group_by(Work.status).all()
        )

        # 按年份統計
        year_stats = (
            self.db.query(Work.year, func.count(Work.id)).group_by(Work.year).all()
        )

        return {
            "total_works": total_works,
            "type_stats": dict(type_stats),
            "status_stats": dict(status_stats),
            "year_stats": dict(year_stats),
        }

    def _work_to_response(self, work: Work) -> WorkResponse:
        """將 Work 模型轉換為 WorkResponse"""
        # 取得標籤
        tags = []
        for work_tag in work.tags:
            tag = self.db.query(Tag).filter(Tag.id == work_tag.tag_id).first()
            if tag:
                tags.append({"id": tag.id, "name": tag.name, "color": tag.color})

        return WorkResponse(
            id=work.id,
            title=work.title,
            type=work.type,
            status=work.status,
            year=work.year,
            progress=work.progress,
            date_added=work.date_added,
            date_updated=work.date_updated,
            rating=work.rating,
            review=work.review,
            note=work.note,
            source=work.source,
            reminder_enabled=work.reminder_enabled,
            reminder_frequency=work.reminder_frequency,
            tags=tags,
        )
