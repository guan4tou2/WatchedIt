# WatchedIt - 看過了

一個自用的作品記錄 Web App，支援動畫、小說、漫畫、電影、電視劇與自定義類型。

## 功能特色

- 📚 **多類型支援**：動畫、小說、漫畫、電影、電視劇、自定義類型
- ⭐ **評分系統**：1-5 星評分
- 🏷️ **標籤管理**：預設標籤 + 自訂標籤
- 🔍 **自動補完**：整合 AniList API 搜尋動畫
- 📊 **統計分析**：年度統計、類型統計
- 🔔 **提醒功能**：可設定 Web 通知提醒
- 📱 **響應式設計**：支援桌機、平板、手機
- 🌙 **主題切換**：深色/淺色主題
- 💾 **資料備份**：JSON/CSV 格式匯出還原

## 技術架構

### 後端
- **Python FastAPI**
- **SQLite 資料庫**
- **uv** 套件管理
- **Docker** 容器化

### 前端
- **Next.js 14**
- **React 18**
- **TypeScript**
- **Tailwind CSS**
- **Shadcn UI**
- **Zustand** 狀態管理

## 快速開始

### 使用 Docker Compose（推薦）

```bash
# 克隆專案
git clone <repository-url>
cd WatchedIt

# 啟動服務
docker-compose up -d

# 訪問應用程式
# 前端: http://localhost:3000
# 後端 API: http://localhost:8000
# API 文件: http://localhost:8000/docs
```

### 本地開發

#### 後端

```bash
cd backend

# 使用 uv 安裝依賴
uv pip install -r requirements.txt

# 啟動開發伺服器
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

#### 前端

```bash
cd frontend

# 安裝依賴
npm install

# 啟動開發伺服器
npm run dev
```

## API 文件

啟動後端服務後，可訪問：
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## 主要 API 端點

### 作品管理
- `GET /works` - 取得作品列表
- `POST /works` - 建立新作品
- `GET /works/{id}` - 取得單一作品
- `PUT /works/{id}` - 更新作品
- `DELETE /works/{id}` - 刪除作品
- `GET /works/stats/overview` - 取得統計資訊

### 標籤管理
- `GET /tags` - 取得所有標籤
- `POST /tags` - 建立新標籤
- `PUT /tags/{id}` - 更新標籤
- `DELETE /tags/{id}` - 刪除標籤

### 搜尋功能
- `GET /search/anime` - 搜尋動畫（AniList API）
- `GET /search/suggestions` - 取得搜尋建議

## 資料結構

### 作品 (Work)
```json
{
  "id": "uuid",
  "title": "作品名稱",
  "type": "動畫",
  "status": "進行中",
  "year": 2024,
  "progress": {
    "episode": 8,
    "total_episode": 12
  },
  "rating": 4,
  "review": "短評",
  "tags": ["冒險", "奇幻"],
  "reminder_enabled": true,
  "reminder_frequency": "weekly"
}
```

## 開發指南

### 新增功能
1. 在 `backend/app/models/` 新增資料模型
2. 在 `backend/app/schemas/` 新增 Pydantic 模型
3. 在 `backend/app/services/` 新增業務邏輯
4. 在 `backend/app/api/` 新增 API 路由
5. 在 `frontend/src/components/` 新增 UI 組件

### 資料庫遷移
```bash
# 建立遷移檔案
alembic revision --autogenerate -m "描述"

# 執行遷移
alembic upgrade head
```

## 部署

### 生產環境
```bash
# 建立生產映像
docker-compose -f docker-compose.prod.yml up -d
```

### 環境變數
- `NEXT_PUBLIC_API_URL`: 前端 API 基礎 URL
- `DATABASE_URL`: 資料庫連接字串

## 授權

MIT License

## 貢獻

歡迎提交 Issue 和 Pull Request！
