# 🎬 WatchedIt - 看過了

一個自架的媒體追蹤 Web App，幫助你記錄和管理看過的動畫、電影、電視劇、小說等作品。

[![GitHub](https://img.shields.io/badge/GitHub-Repository-blue?style=flat-square&logo=github)](https://github.com/guantou/WatchedIt)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)

## ✨ 功能特色

- 📺 **多媒體支援**: 動畫、電影、電視劇、小說等
- ⭐ **評分系統**: 1-5 星評分
- 🏷️ **標籤管理**: 自定義標籤分類
- 📊 **統計分析**: 年度統計、類型分析
- 🔍 **智能搜尋**: AniList API 自動完成
- 🇹🇼 **繁體中文支援**: 使用 OpenCC 進行高質量的簡體轉繁體轉換
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

### 方式四：環境變數配置

如果需要自定義 API 網址，可以創建 `.env.local` 檔案：

```bash
# 複製環境變數範例
cp frontend/env.example frontend/.env.local

# 編輯配置
# NEXT_PUBLIC_API_URL=http://localhost:8000  # 開發環境
# NEXT_PUBLIC_API_URL=https://your-api.com   # 生產環境
# NEXT_PUBLIC_API_URL=                       # 使用相對路徑
```

### 方式四：GitHub Pages 部署（已移除）

GitHub Pages 部署已被移除，推薦使用 Vercel 部署。

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

## 🚀 生產部署

詳細的生產部署指南請參考 [DEPLOYMENT.md](./DEPLOYMENT.md)

### 推薦部署方案

#### 方案一：Vercel 部署（最簡單）

```bash
# 安裝 Vercel CLI
npm i -g vercel

# 登入並部署
vercel login
cd frontend
vercel --prod
```

**優點**: 零配置、自動 HTTPS、全球 CDN、免費額度充足

**實際部署**: https://watchedit-psi.vercel.app (已整合 Speed Insights 性能監控)

#### 方案二：Netlify 部署

```bash
# 構建並部署
cd frontend
npm run build
netlify deploy --prod --dir=out
```

**優點**: 簡單易用、自動 HTTPS、表單處理支援

#### 方案三：Docker 生產部署

```bash
# 構建並啟動生產環境
docker-compose -f docker-compose.prod.yml up -d --build

# 查看服務狀態
docker-compose ps
```

**優點**: 環境一致、易於擴展、完整控制

### 生產環境配置

1. **環境變數設置**
   - 創建 `.env.production` 文件
   - 配置 API URL 和域名
   - 設置安全密鑰

2. **安全配置**
   - 啟用 HTTPS 強制
   - 配置 CORS 策略
   - 設置安全標頭

3. **性能優化**
   - 啟用 Gzip 壓縮
   - 配置 CDN
   - 優化資源載入

### 監控和維護

- **錯誤追蹤**: 集成 Sentry
- **性能監控**: 使用 Vercel Analytics
- **日誌管理**: 配置結構化日誌
- **健康檢查**: 設置端點監控

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
├── docs/                           # 📚 專案文檔
│   ├── README.md                   # 文檔索引
│   ├── implementation/             # 實現文檔
│   ├── deployment/                 # 部署文檔
│   └── features/                   # 功能文檔
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

## 📚 文檔

詳細的技術文檔和實現說明請查看 [docs/](docs/) 目錄：

- **[📋 實現文檔](docs/implementation/)** - 各種功能的技術實現細節
- **[🚀 部署文檔](docs/deployment/)** - 部署指南和配置說明
- **[✨ 功能文檔](docs/features/)** - 新功能和改進說明

## 🔍 故障排除

### 常見問題

1. **404 錯誤**
   - 確保所有路由都使用 `getFullPath()` 函數
   - 檢查 Vercel 部署設置

2. **圖片不顯示**
   - 檢查 `next.config.js` 中的 `images.unoptimized` 設置
   - 確認圖片域名已添加到 `domains` 配置

3. **部署失敗**
   - 檢查 Vercel 部署日誌中的錯誤信息
   - 確認 Node.js 版本和依賴安裝

4. **PWA 不工作**
   - 檢查 `manifest.json` 配置
   - 確認 Service Worker 註冊

## 🤝 貢獻

歡迎提交 Issue 和 Pull Request！

### 參與貢獻

1. **Fork 本專案**
2. **創建功能分支** (`git checkout -b feature/AmazingFeature`)
3. **提交變更** (`git commit -m 'Add some AmazingFeature'`)
4. **推送到分支** (`git push origin feature/AmazingFeature`)
5. **開啟 Pull Request**

### 開發環境設置

```bash
# 克隆專案
git clone https://github.com/guantou/WatchedIt.git
cd WatchedIt

# 安裝依賴
cd frontend && npm install
cd ../backend && uv sync

# 啟動開發環境
cd ../frontend && npm run dev
```

## 📄 授權

本專案採用 MIT 授權條款 - 詳見 [LICENSE](LICENSE) 檔案

## 🔗 相關連結

- **GitHub Repository**: https://github.com/guantou/WatchedIt
- **線上 Demo**: https://watchedit-psi.vercel.app
- **問題回報**: https://github.com/guantou/WatchedIt/issues
- **功能請求**: https://github.com/guantou/WatchedIt/issues/new
