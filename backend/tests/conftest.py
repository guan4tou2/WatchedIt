import asyncio

import pytest
from app.db.database import Base, get_db
from app.main import app
from httpx import AsyncClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

# 使用記憶體資料庫進行測試
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()


@pytest.fixture(scope="session")
def event_loop():
    """Create an instance of the default event loop for each test case."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest.fixture(scope="function")
async def client():
    """Create a test client for the FastAPI app."""
    # 創建測試資料庫表
    Base.metadata.create_all(bind=engine)

    # 覆蓋依賴
    app.dependency_overrides[get_db] = override_get_db

    async with AsyncClient(app=app, base_url="http://test") as ac:
        yield ac

    # 清理
    Base.metadata.drop_all(bind=engine)
    app.dependency_overrides.clear()


@pytest.fixture
def sample_work_data():
    """Sample work data for testing."""
    return {
        "title": "測試作品",
        "type": "動畫",
        "status": "進行中",
        "year": 2024,
        "rating": 8.5,
        "review": "測試評論",
        "note": "測試備註",
        "source": "測試",
    }


@pytest.fixture
def sample_tag_data():
    """Sample tag data for testing."""
    return {
        "name": "測試標籤",
        "color": "#ff0000",
    }
