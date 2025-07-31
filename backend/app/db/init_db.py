from .database import Base, engine


def init_db():
    """初始化資料庫"""
    # 創建所有表格
    Base.metadata.create_all(bind=engine)


def get_db():
    """取得資料庫會話"""
    from .database import SessionLocal

    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
