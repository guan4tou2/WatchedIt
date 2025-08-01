# 🚀 WatchedIt 部署指南

## 概述

WatchedIt 是一個支援 GitHub Pages 部署的 Next.js 應用程式。本文檔提供完整的部署說明和故障排除指南。

## 📋 部署前準備

### 1. GitHub 倉庫設定

確保你的 GitHub 倉庫設定正確：

1. 進入倉庫設定 (Settings)
2. 找到 Pages 設定
3. 選擇 "GitHub Actions" 作為部署源
4. 點擊 Save

### 2. GitHub Actions 權限設定

確保 Actions 權限設定正確：

1. 進入 Settings > Actions > General
2. 將 "Workflow permissions" 設為 "Read and write permissions"
3. 勾選 "Allow GitHub Actions to create and approve pull requests"

## 🚀 自動部署

### 部署流程

推送程式碼到 `main` 分支後，GitHub Actions 會自動執行：

1. **檢查程式碼**：使用 actions/checkout@v4
2. **設定 Node.js**：使用 actions/setup-node@v4
3. **安裝依賴**：執行 `npm ci`
4. **建置專案**：執行 `npm run build:production`
5. **設定 Pages**：使用 actions/configure-pages@v4
6. **上傳構件**：使用 actions/upload-pages-artifact@v3
7. **部署到 Pages**：使用 actions/deploy-pages@v4

### 部署配置

專案使用以下配置進行生產環境建置：

```javascript
// next.config.js
const nextConfig = {
  basePath: process.env.NODE_ENV === "production" ? "/WatchedIt" : "",
  assetPrefix: process.env.NODE_ENV === "production" ? "/WatchedIt/" : "",
  output: "export",
  trailingSlash: true,
  skipTrailingSlashRedirect: true,
  skipMiddlewareUrlNormalize: true,
  images: {
    unoptimized: true,
    domains: ["s4.anilist.co"],
  },
};
```

## 🔧 本地測試部署

### 1. 安裝依賴

```bash
cd frontend
npm install
```

### 2. 本地建置測試

```bash
# 建置生產版本
npm run build:production

# 或建置本地版本
npm run build:local
```

### 3. 測試靜態檔案

```bash
# 使用 Python 簡單伺服器測試
cd frontend/out
python3 -m http.server 8000
```

然後訪問 `http://localhost:8000`

## 🌐 部署後檢查

### 1. 網站訪問

部署完成後，你的應用程式會在：
`https://[你的用戶名].github.io/WatchedIt/`

### 2. 功能檢查清單

- [ ] 主頁正常載入
- [ ] 作品列表顯示正常
- [ ] 新增作品功能正常
- [ ] 作品詳情頁面正常
- [ ] 設定頁面正常
- [ ] PWA 功能正常
- [ ] 深色主題切換正常
- [ ] 響應式設計正常

## 🐛 故障排除

### 1. 部署失敗

**問題**：GitHub Actions 部署失敗

**解決方案**：
1. 檢查 Actions 權限設定
2. 確認 workflow 檔案語法正確
3. 檢查 Node.js 版本相容性
4. 查看 Actions 日誌獲取詳細錯誤信息

### 2. 靜態資源載入失敗

**問題**：CSS、JS、圖片等靜態資源 404

**解決方案**：
1. 檢查 `next.config.js` 中的 `basePath` 和 `assetPrefix`
2. 確認 `manifest.json` 中的路徑包含 `/WatchedIt` 前綴
3. 檢查 `public` 目錄下的檔案是否正確

### 3. 路由問題

**問題**：直接訪問子頁面返回 404

**解決方案**：
1. 確認 `404.html` 檔案存在且內容正確
2. 檢查 SPA 路由重定向邏輯
3. 確認 `getFullPath` 函數正確實現

### 4. PWA 功能異常

**問題**：Service Worker 註冊失敗或 PWA 功能異常

**解決方案**：
1. 檢查 `sw.js` 檔案路徑
2. 確認 manifest.json 路徑正確
3. 檢查 Service Worker 註冊邏輯

### 5. 深色主題問題

**問題**：深色主題切換異常

**解決方案**：
1. 檢查 ThemeProvider 組件
2. 確認 CSS 變數設定正確
3. 檢查 localStorage 中的主題設定

## 📁 專案結構

```
WatchedIt/
├── frontend/                 # Next.js 前端應用
│   ├── src/
│   │   ├── app/             # App Router 頁面
│   │   ├── components/      # React 組件
│   │   ├── lib/            # 工具函數
│   │   ├── store/          # Zustand 狀態管理
│   │   └── types/          # TypeScript 類型定義
│   ├── public/             # 靜態資源
│   ├── next.config.js      # Next.js 配置
│   └── package.json        # 依賴配置
├── backend/                 # FastAPI 後端 (可選)
├── .github/workflows/      # GitHub Actions
├── DEPLOYMENT.md           # 本文檔
└── README.md              # 專案說明
```

## 🔄 更新部署

### 1. 程式碼更新

```bash
# 提交變更
git add .
git commit -m "feat: 新功能描述"
git push origin main
```

### 2. 手動觸發部署

如果需要手動觸發部署：

1. 前往 GitHub Actions 頁面
2. 選擇 "Deploy to GitHub Pages" workflow
3. 點擊 "Run workflow"

## 📞 支援

如果遇到部署問題：

1. 檢查 GitHub Actions 日誌
2. 查看瀏覽器開發者工具錯誤
3. 確認所有配置檔案正確
4. 參考本文檔的故障排除指南

---

**最後更新**：2025年8月
**版本**：v1.0.0 