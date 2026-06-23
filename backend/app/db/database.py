import os

from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker


def get_database_url() -> str:
    return os.getenv("DATABASE_URL", "sqlite:///./watchedit.db")


def get_connect_args(database_url: str) -> dict[str, bool]:
    if database_url.startswith("sqlite"):
        return {"check_same_thread": False}
    return {}


# 資料庫檔案路徑
DATABASE_URL = get_database_url()
SQL_ECHO = os.getenv("SQL_ECHO", "false").lower() == "true"

# 建立引擎
engine = create_engine(
    DATABASE_URL, connect_args=get_connect_args(DATABASE_URL), echo=SQL_ECHO
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
