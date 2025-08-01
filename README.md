# 🎬 WatchedIt - 看過了

一個自架的媒體追蹤 Web App，幫助你記錄和管理看過的動畫、電影、電視劇、小說等作品。

## ✨ 功能特色

- 📺 **多媒體支援**: 動畫、電影、電視劇、小說等
- ⭐ **評分系統**: 1-5 星評分
- 🏷️ **標籤管理**: 自定義標籤分類
- 📊 **統計分析**: 年度統計、類型分析
- 🔍 **智能搜尋**: AniList API 自動完成
- 📱 **響應式設計**: 支援桌面和行動裝置
- 💾 **本地儲存**: 數據儲存在瀏覽器本地
- 🌐 **跨平台支援**: PWA 技術，支援所有平台

## 🚀 快速開始

### 方式一：純前端模式（推薦）

使用瀏覽器本地儲存，無需後端服務：

```bash
# 1. 安裝依賴
cd frontend
npm install

# 2. 啟動開發伺服器
npm run dev
```

訪問 http://localhost:3000 即可使用！

### 方式二：完整模式（含後端）

```bash
# 1. 啟動後端
cd backend
uv run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# 2. 啟動前端
cd frontend
npm run dev
```

### 方式三：使用 Docker

```bash
# 一鍵啟動所有服務
docker-compose up -d
```

## 📱 安裝到設備

### Android
1. 使用 Chrome 瀏覽器訪問應用
2. 點擊瀏覽器選單中的「安裝應用程式」
3. 確認安裝，應用程式會出現在主畫面

### iOS
1. 使用 Safari 瀏覽器訪問應用
2. 點擊分享按鈕
3. 選擇「添加到主畫面」
4. 應用程式會出現在主畫面

### Windows
1. 使用 Edge 瀏覽器訪問應用
2. 點擊地址欄旁的安裝按鈕
3. 確認安裝，應用程式會出現在開始選單

### macOS
1. 使用 Safari 瀏覽器訪問應用
2. 點擊分享按鈕
3. 選擇「添加到 Dock」
4. 應用程式會出現在 Dock

## 🛠️ 技術架構

### 前端
- **框架**: Next.js 14 + React 18
- **語言**: TypeScript
- **樣式**: Tailwind CSS + Shadcn UI
- **狀態管理**: Zustand
- **圖標**: Lucide React
- **PWA**: Service Worker + Manifest

### 後端 (可選)
- **框架**: FastAPI
- **語言**: Python 3.11+
- **資料庫**: SQLite
- **ORM**: SQLAlchemy
- **驗證**: Pydantic

### 開發工具
- **包管理**: uv (Python) + npm (Node.js)
- **容器化**: Docker + docker-compose

## 📱 使用方式

### 主頁面
- 查看統計數據
- 瀏覽最近作品
- 快速新增作品
- 查看平台資訊

### 測試頁面
- **本地儲存測試**: http://localhost:3000/local-test
- **API 測試**: http://localhost:3000/test

## 🚀 部署

詳細的部署指南請參考 [DEPLOYMENT.md](./DEPLOYMENT.md)

### GitHub Pages 部署（推薦）

1. 推送代碼到 GitHub
2. 啟用 GitHub Pages
3. 配置 GitHub Actions 權限
4. 自動部署完成

訪問地址：`https://[您的用戶名].github.io/WatchedIt/`

### 其他部署方式

```bash
# Vercel (推薦)
npm i -g vercel
vercel --prod

# Netlify
npm run build
# 上傳 out 目錄到 Netlify

# Docker
docker-compose up -d --build
```

## 🧪 測試

### 前端測試
```bash
cd frontend
npm test                    # 運行測試
npm run test:coverage      # 生成覆蓋率報告
npm run test:watch         # 監視模式
```

### 後端測試
```bash
cd backend
pytest                     # 運行測試
pytest --cov=app          # 生成覆蓋率報告
```

## 📊 數據結構

### 作品 (Work)
```typescript
interface Work {
  id: string
  title: string
  type: '動畫' | '電影' | '電視劇' | '小說'
  status: '進行中' | '已完結' | '暫停' | '放棄'
  year?: number
  rating?: number
  review?: string
  note?: string
  source?: string
  tags: Tag[]
  episodes: Episode[]
  date_added: string
  date_updated?: string
}
```

### 標籤 (Tag)
```typescript
interface Tag {
  id: number
  name: string
  color: string
}
```

## 📁 項目結構

```
WatchedIt/
├── .github/workflows/deploy.yml    # GitHub Actions 工作流程
├── frontend/                       # 前端應用
│   ├── next.config.js              # Next.js 配置
│   ├── package.json                # 依賴和腳本
│   └── src/
│       ├── app/                    # 頁面組件
│       ├── components/             # UI 組件
│       ├── lib/                    # 工具函數
│       ├── store/                  # 狀態管理
│       └── types/                  # TypeScript 類型
├── backend/                        # 後端 API
│   ├── app/                        # FastAPI 應用
│   ├── requirements.txt            # Python 依賴
│   └── Dockerfile                  # Docker 配置
├── deploy.sh                       # 部署腳本
├── docker-compose.yml              # Docker Compose
└── README.md                       # 項目說明
```

## 🔍 故障排除

### 常見問題

1. **404 錯誤**
   - 確保所有路由都使用 `getFullPath()` 函數
   - 檢查 GitHub Pages 設置

2. **圖片不顯示**
   - 檢查 `next.config.js` 中的 `images.unoptimized` 設置
   - 確認圖片域名已添加到 `domains` 配置

3. **部署失敗**
   - 檢查 GitHub Actions 日誌中的錯誤信息
   - 確認 Node.js 版本和依賴安裝

4. **PWA 不工作**
   - 檢查 `manifest.json` 配置
   - 確認 Service Worker 註冊

## 🤝 貢獻

歡迎提交 Issue 和 Pull Request！

## 📄 授權

MIT License
