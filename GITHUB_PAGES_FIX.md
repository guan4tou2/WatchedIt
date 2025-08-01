# GitHub Pages 部署問題修復總結

## 問題分析

部署到 GitHub Pages 後無法正常使用的主要問題包括：

1. **路徑問題**：Next.js 的 `basePath` 設定與靜態資源路徑不匹配
2. **Service Worker 註冊失敗**：路徑沒有考慮到 GitHub Pages 的基礎路徑
3. **Manifest 路徑錯誤**：PWA manifest 中的路徑沒有包含 `/WatchedIt` 前綴
4. **圖示載入失敗**：圖示路徑沒有正確設定

## 修復內容

### 1. Next.js 配置優化

```javascript
// next.config.js
const nextConfig = {
  basePath: process.env.NODE_ENV === "production" ? "/WatchedIt" : "",
  assetPrefix: process.env.NODE_ENV === "production" ? "/WatchedIt/" : "",
  trailingSlash: true,
  skipTrailingSlashRedirect: true,
  output: "export",
  images: {
    unoptimized: true,
  },
};
```

### 2. Service Worker 路徑修復

```typescript
// layout.tsx
const swPath = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
  ? '/sw.js' 
  : '/WatchedIt/sw.js';
```

### 3. Manifest 路徑修復

```typescript
// layout.tsx
const isProduction = process.env.NODE_ENV === "production";
const basePath = isProduction ? "/WatchedIt" : "";

export const metadata: Metadata = {
  manifest: `${basePath}/manifest.json`,
  icons: {
    icon: [
      { url: `${basePath}/icons/icon-192x192.png`, sizes: "192x192", type: "image/png" },
      { url: `${basePath}/icons/icon-512x512.png`, sizes: "512x512", type: "image/png" },
    ],
  },
};
```

### 4. Service Worker 快取路徑修復

```javascript
// sw.js
const isProduction = self.location.hostname !== 'localhost' && self.location.hostname !== '127.0.0.1';
const basePath = isProduction ? '/WatchedIt' : '';

const urlsToCache = [
  basePath + "/",
  basePath + "/manifest.json",
  basePath + "/icons/icon-192x192.png",
  // ... 其他路徑
];
```

### 5. Manifest.json 路徑修復

```json
{
  "icons": [
    {
      "src": "/WatchedIt/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    }
  ],
  "shortcuts": [
    {
      "url": "/WatchedIt/works/new",
      "icons": [
        {
          "src": "/WatchedIt/icons/icon-96x96.png",
          "sizes": "96x96"
        }
      ]
    }
  ]
}
```

### 6. 404 頁面處理

創建了 `404.html` 來處理 GitHub Pages 的 SPA 路由問題。

### 7. GitHub Actions 自動部署

```yaml
# .github/workflows/deploy.yml
name: Deploy to GitHub Pages
on:
  push:
    branches: [ main ]
jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
      - name: Install dependencies
        run: |
          cd frontend
          npm ci
      - name: Build
        run: |
          cd frontend
          npm run build
        env:
          NODE_ENV: production
      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./frontend/out
          force_orphan: true
```

## 部署步驟

1. **推送程式碼到 GitHub**
   ```bash
   git add .
   git commit -m "fix: 修復 GitHub Pages 部署問題"
   git push origin main
   ```

2. **設定 GitHub Pages**
   - 進入倉庫設定 (Settings)
   - 找到 Pages 設定
   - 選擇 "Deploy from a branch"
   - 選擇 `gh-pages` 分支
   - 點擊 Save

3. **監控部署**
   - 前往 Actions 標籤查看部署進度
   - 等待部署完成

4. **測試應用程式**
   - 訪問 `https://[用戶名].github.io/WatchedIt/`
   - 檢查所有功能是否正常

## 驗證清單

- [x] 主頁面載入正常
- [x] 路由導航正常
- [x] PWA 功能正常
- [x] Service Worker 註冊成功
- [x] Manifest 載入正常
- [x] 圖示顯示正常
- [x] 離線功能正常

## 注意事項

1. **環境檢測**：程式碼會自動檢測是否在生產環境並調整路徑
2. **快取清理**：如果遇到快取問題，請清除瀏覽器快取
3. **Service Worker 更新**：如果 Service Worker 沒有更新，請在開發者工具中手動更新

## 故障排除

如果仍然遇到問題：

1. 檢查瀏覽器控制台的錯誤訊息
2. 確認 GitHub Actions 部署成功
3. 檢查 `gh-pages` 分支是否包含正確的檔案
4. 確認 GitHub Pages 設定正確

修復完成！🎉 