# WatchedIt - 看過了

> 一個現代化、本地優先的媒體追蹤應用程式，支援動畫、電影、電視劇、小說、漫畫和遊戲。

![首頁淺色模式](./docs/images/home-light.png)

## ✨ 功能特色

### 📱 漸進式網頁應用 (PWA)
- **可安裝**: 可新增至手機和桌面的主畫面
- **離線支援**: 無網路連線也能使用
- **快速響應**: 如同原生應用程式的體驗

### 🎬 媒體追蹤
- 追蹤多種媒體類型：動畫、電影、電視劇、小說、漫畫、遊戲
- 集數/章節管理，支援自訂類型
- 進度追蹤和完成率統計
- 評分和心得系統
- 自訂標籤和分類

### 🔍 AniList 整合
- 直接從 AniList 搜尋和匯入動畫
- 自動抓取詮釋資料
- 與追蹤工作流程無縫整合

### 💾 本地優先架構
- **IndexedDB 儲存**: 所有資料儲存在瀏覽器本地
- **無需帳號**: 立即開始追蹤
- **隱私優先**: 您的資料不會離開您的裝置
- **資料遷移**: 自動從 localStorage 遷移至 IndexedDB
- **備份與還原**: 隨時匯出和匯入您的資料

### 🎨 現代化 UI/UX
- **深色模式**: 完整的深色模式支援，自動偵測系統偏好
- **響應式設計**: 針對手機、平板和桌面優化
- **流暢動畫**: 精緻的轉場和微互動
- **無障礙**: 注重無障礙設計

### 🔧 進階功能
- **批量操作**: 一次編輯或刪除多個作品
- **進階篩選**: 依類型、狀態、年份、標籤、評分和進度篩選
- **搜尋**: 全文搜尋標題、心得和備註
- **提醒**: 為進行中的系列設定提醒
- **統計**: 視覺化您的觀看習慣

## 🚀 技術堆疊

### 前端
- **框架**: [Next.js 14](https://nextjs.org/) (App Router)
- **語言**: TypeScript
- **樣式**: Tailwind CSS
- **UI 元件**: [shadcn/ui](https://ui.shadcn.com/)
- **狀態管理**: [Zustand](https://github.com/pmndrs/zustand)
- **圖示**: [Lucide React](https://lucide.dev/)
- **國際化**: [next-intl](https://next-intl-docs.vercel.app/)

### 後端
- **框架**: [FastAPI](https://fastapi.tiangolo.com/) (Python)
- **資料庫**: SQLite
- **ORM**: SQLAlchemy

### 儲存
- **主要**: IndexedDB (透過 Dexie.js)
- **舊版**: LocalStorage (自動遷移)

## 📸 截圖

### 淺色模式
![淺色模式](./docs/images/screenshot-light.png)

### 深色模式
![深色模式](./docs/images/screenshot-dark.png)

### AniList 搜尋
![AniList 搜尋](./docs/images/anilist-search.png)

### 設定頁面
![設定](./docs/images/settings.png)

## 🛠️ 開始使用

### 前置需求
- Node.js 18+ (前端)
- Python 3.8+ (後端，選用)

### 安裝

#### 僅前端 (推薦給大多數使用者)
```bash
# 複製儲存庫
git clone https://github.com/guan4tou2/WatchedIt.git
cd WatchedIt/frontend

# 安裝相依套件
npm install

# 執行開發伺服器
npm run dev

# 開啟 http://localhost:3000
```

#### 含後端 (選用)
```bash
# 終端機 1: 後端
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload

# 終端機 2: 前端
cd frontend
npm install
npm run dev
```

### 🧪 測試

#### 單元測試
使用 Jest 執行單元測試：
```bash
cd frontend
npm test
```

#### 端對端 (E2E) 測試
使用 Playwright 執行 E2E 測試：
```bash
cd frontend
npx playwright test
```

### 建置正式版本
```bash
cd frontend
npm run build
npm start
```

## 📦 部署

### Vercel (推薦)
[![使用 Vercel 部署](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/guan4tou2/WatchedIt)

### Docker
```bash
# 前端
cd frontend
docker build -t watchedit-frontend .
docker run -p 3000:3000 watchedit-frontend

# 後端
cd backend
docker build -t watchedit-backend .
docker run -p 8000:8000 watchedit-backend
```

## 🌐 國際化

WatchedIt 支援多種語言：
- 英文 (en)
- 繁體中文 (zh-TW)

可使用標題列的地球圖示切換語言。

## 🤝 貢獻

歡迎貢獻！請隨時提交 Pull Request。

1. Fork 此儲存庫
2. 建立您的功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交您的變更 (`git commit -m 'Add some AmazingFeature'`)
4. 推送至分支 (`git push origin feature/AmazingFeature`)
5. 開啟 Pull Request

## 📄 授權

此專案為開源專案，採用 [MIT 授權](LICENSE)。

## 🙏 致謝

- [AniList](https://anilist.co/) 提供動畫資料庫 API
- [shadcn/ui](https://ui.shadcn.com/) 提供精美的 UI 元件
- [Lucide](https://lucide.dev/) 提供圖示
- 所有貢獻者和使用者

## 📧 聯絡方式

- GitHub: [@guan4tou2](https://github.com/guan4tou2)
- 專案連結: [https://github.com/guan4tou2/WatchedIt](https://github.com/guan4tou2/WatchedIt)

---

用 ❤️ 製作，來自 WatchedIt 團隊
