from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# 資料庫檔案路徑
DATABASE_URL = "sqlite:///./watchedit.db"

# 建立引擎
engine = create_engine(
    DATABASE_URL, connect_args={"check_same_thread": False}, echo=True
)

# 建立 SessionLocal 類別
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# 建立 Base 類別
Base = declarative_base()


# 依賴注入函數
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
