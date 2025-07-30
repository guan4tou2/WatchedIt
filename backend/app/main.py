from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .api import search_router, tags_router, works_router
from .db.database import Base, engine

# 建立資料表
Base.metadata.create_all(bind=engine)

# 建立 FastAPI 應用程式
app = FastAPI(
    title="WatchedIt API", description="看過了 - 作品記錄 Web App API", version="1.0.0"
)

# 設定 CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 開發環境允許所有來源
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 註冊路由
app.include_router(works_router)
app.include_router(tags_router)
app.include_router(search_router)


@app.get("/")
async def root():
    """根路徑"""
    return {"message": "WatchedIt API", "version": "1.0.0", "docs": "/docs"}


@app.get("/health")
async def health_check():
    """健康檢查"""
    return {"status": "healthy"}
