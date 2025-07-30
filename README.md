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

## 📱 跨平台支援

### ✅ 支援平台
- **Android**: Chrome, Samsung Internet, Firefox
- **iOS**: Safari, Chrome
- **Windows**: Edge, Chrome, Firefox
- **macOS**: Safari, Chrome, Firefox
- **Linux**: Chrome, Firefox
- **Web**: 所有現代瀏覽器

### 🎯 PWA 功能
- ✅ **離線使用**: 無網路也能正常使用
- ✅ **安裝到主畫面**: 像原生應用程式一樣
- ✅ **推送通知**: 重要提醒即時通知
- ✅ **背景同步**: 自動同步數據
- ✅ **原生體驗**: 流暢的應用程式體驗

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

## 📱 使用方式

### 主頁面
- 查看統計數據
- 瀏覽最近作品
- 快速新增作品
- 查看平台資訊

### 測試頁面
- **本地儲存測試**: http://localhost:3000/local-test
- **API 測試**: http://localhost:3000/test

## 🔧 開發指南

### 本地儲存模式
- 數據儲存在瀏覽器的 localStorage
- 支援離線使用
- 數據持久化在本地

### API 模式
- 數據儲存在 SQLite 資料庫
- 支援多用戶
- 可部署到伺服器

### PWA 開發
- Service Worker 處理離線功能
- Manifest 文件定義應用程式屬性
- 平台檢測自動適配

### 數據結構

#### 作品 (Work)
```typescript
interface Work {
  id: string
  title: string
  type: '動畫' | '電影' | '電視劇' | '小說'
  status: '進行中' | '已完成' | '暫停' | '放棄'
  year?: number
  progress?: number
  rating?: number
  review?: string
  note?: string
  source?: string
  reminder_enabled: boolean
  reminder_frequency?: string
  tags: Tag[]
  date_added: string
  date_updated?: string
}
```

#### 標籤 (Tag)
```typescript
interface Tag {
  id: number
  name: string
  color: string
}
```

## 📊 API 端點

### 作品相關
- `GET /works` - 取得作品列表
- `POST /works` - 新增作品
- `GET /works/{id}` - 取得單一作品
- `PUT /works/{id}` - 更新作品
- `DELETE /works/{id}` - 刪除作品
- `GET /works/stats/overview` - 取得統計數據

### 標籤相關
- `GET /tags` - 取得標籤列表
- `POST /tags` - 新增標籤
- `PUT /tags/{id}` - 更新標籤
- `DELETE /tags/{id}` - 刪除標籤

### 搜尋相關
- `GET /search/anime?q={query}` - 搜尋動畫
- `GET /search/suggestions?q={query}` - 取得建議

## 🎯 下一步計劃

- [ ] 新增作品表單
- [ ] 作品詳情頁面
- [ ] 編輯功能
- [ ] 搜尋和篩選
- [ ] 數據匯出/匯入
- [ ] 主題切換
- [ ] 雲端同步
- [ ] 多用戶支援

## 📝 開發筆記

### 本地儲存優勢
- 無需後端服務
- 快速啟動
- 離線使用
- 數據隱私

### 後端 API 優勢
- 多設備同步
- 數據備份
- 多用戶支援
- 進階功能

### PWA 優勢
- 跨平台相容
- 原生應用體驗
- 離線功能
- 自動更新

## 🚀 部署

詳細的跨平台部署指南請參考 [DEPLOYMENT.md](./DEPLOYMENT.md)

### 快速部署
```bash
# Vercel (推薦)
npm i -g vercel
vercel --prod

# Netlify
npm run build
# 上傳 out 目錄到 Netlify

# GitHub Pages
npm run export
# 上傳 out 目錄到 GitHub Pages
```

## 🤝 貢獻

歡迎提交 Issue 和 Pull Request！

## 📄 授權

MIT License
