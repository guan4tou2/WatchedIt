from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import os

from .api import search_router, tags_router, works_router
from .api.cloud import router as cloud_router
from .db.database import Base, engine
from .exceptions import WatchedItException
from .utils.logger import logger

# 建立資料表
Base.metadata.create_all(bind=engine)

# 建立 FastAPI 應用程式
app = FastAPI(
    title="WatchedIt API", description="看過了 - 作品記錄 Web App API", version="1.0.0"
)

# 設定 CORS - 從環境變數讀取允許的來源
ALLOWED_ORIGINS = os.getenv(
    "ALLOWED_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000"
).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,  # 限制特定來源
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],  # 限制特定方法
    allow_headers=["*"],
    max_age=3600,  # 快取 preflight 請求
)


# 全域異常處理器
@app.exception_handler(WatchedItException)
async def watchedit_exception_handler(request: Request, exc: WatchedItException):
    """Handle custom WatchedIt exceptions."""
    logger.error(f"WatchedIt exception: {exc.message}")
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.message},
    )

# 註冊路由
app.include_router(works_router)
app.include_router(tags_router)
app.include_router(search_router)
app.include_router(cloud_router, prefix="/cloud", tags=["cloud"])


@app.get("/")
async def root():
    """根路徑"""
    return {"message": "WatchedIt API", "version": "1.0.0", "docs": "/docs"}


@app.get("/health")
async def health_check():
    """健康檢查"""
    return {"status": "healthy"}
