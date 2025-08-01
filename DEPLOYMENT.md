# GitHub Pages 部署說明

## 部署步驟

### 1. 準備工作

確保你的 GitHub 倉庫設定正確：

1. 進入倉庫設定 (Settings)
2. 找到 Pages 設定
3. 選擇 "Deploy from a branch"
4. 選擇 `gh-pages` 分支
5. 點擊 Save

### 2. 本地部署測試

```bash
# 進入前端目錄
cd frontend

# 安裝依賴
npm install

# 建置專案
npm run build

# 測試本地部署
npm run deploy
```

### 3. 自動部署

推送程式碼到 `main` 分支後，GitHub Actions 會自動：

1. 安裝依賴
2. 建置專案
3. 部署到 `gh-pages` 分支

### 4. 檢查部署

部署完成後，你的應用程式會在：
`https://[你的用戶名].github.io/WatchedIt/`

## 常見問題

### 1. 路由問題

如果遇到路由問題，請檢查：
- `next.config.js` 中的 `basePath` 設定
- `manifest.json` 中的路徑是否正確
- Service Worker 的路徑設定

### 2. 靜態資源載入失敗

確保：
- 所有圖示檔案都在 `public/icons/` 目錄下
- `manifest.json` 中的路徑包含 `/WatchedIt` 前綴

### 3. Service Worker 註冊失敗

檢查：
- `layout.tsx` 中的 Service Worker 註冊路徑
- `sw.js` 中的快取路徑設定

## 手動部署

如果需要手動部署：

```bash
# 建置專案
cd frontend
npm run build

# 複製 404.html 到輸出目錄
cp public/404.html out/404.html

# 創建 .nojekyll 檔案
touch out/.nojekyll

# 將 out 目錄的內容推送到 gh-pages 分支
```

## 環境變數

確保以下環境變數在生產環境中正確設定：

- `NODE_ENV=production`
- `NEXT_PUBLIC_BASE_PATH=/WatchedIt` (如果需要) 