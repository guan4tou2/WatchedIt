# WatchedIt GitHub Pages 部署指南

## 概述

本專案已配置為自動部署到 GitHub Pages。當您推送代碼到 `main` 分支時，GitHub Actions 會自動構建並部署應用程序。

## 部署步驟

### 1. 準備 GitHub 倉庫

1. 確保您的 GitHub 倉庫名稱為 `WatchedIt`
2. 確保代碼已推送到 `main` 分支

### 2. 啟用 GitHub Pages

1. 前往您的 GitHub 倉庫
2. 點擊 "Settings" 標籤
3. 在左側菜單中找到 "Pages"
4. 在 "Source" 部分選擇 "Deploy from a branch"
5. 選擇 "gh-pages" 分支和 "/ (root)" 文件夾
6. 點擊 "Save"

### 3. 配置 GitHub Actions 權限

1. 在倉庫的 "Settings" 頁面
2. 點擊 "Actions" > "General"
3. 在 "Workflow permissions" 部分選擇 "Read and write permissions"
4. 點擊 "Save"

### 4. 觸發部署

推送代碼到 `main` 分支：

```bash
git add .
git commit -m "feat: 準備部署到 GitHub Pages"
git push origin main
```

### 5. 監控部署

1. 前往倉庫的 "Actions" 標籤
2. 查看 "Deploy to GitHub Pages" 工作流程
3. 等待構建完成

## 訪問應用程序

部署完成後，您的應用程序將在以下地址可用：

- **GitHub Pages URL**: `https://[您的用戶名].github.io/WatchedIt/`
- **自定義域名** (如果配置): `https://watchedit.app`

## 配置說明

### Next.js 配置

專案已配置以下設置以支援 GitHub Pages：

```javascript
// next.config.js
{
  basePath: process.env.NODE_ENV === 'production' ? '/WatchedIt' : '',
  assetPrefix: process.env.NODE_ENV === 'production' ? '/WatchedIt/' : '',
  trailingSlash: true,
  output: 'export',
  images: {
    unoptimized: true,
  }
}
```

### 路由處理

所有路由都使用 `getFullPath()` 工具函數來處理 GitHub Pages 的 basePath：

```typescript
import { getFullPath } from "@/lib/utils";

// 使用示例
router.push(getFullPath("/"));
```

## 故障排除

### 常見問題

1. **404 錯誤**: 確保所有路由都使用 `getFullPath()` 函數
2. **圖片不顯示**: 檢查 `next.config.js` 中的 `images.unoptimized` 設置
3. **部署失敗**: 檢查 GitHub Actions 日誌中的錯誤信息

### 本地測試

在本地測試生產構建：

```bash
cd frontend
npm run build
npm run start
```

## 自定義域名

如果要使用自定義域名：

1. 在 GitHub Pages 設置中添加自定義域名
2. 更新 `.github/workflows/deploy.yml` 中的 `cname` 設置
3. 確保 DNS 記錄正確配置

## 注意事項

- 確保所有 API 端點都支援 HTTPS
- 檢查 PWA 配置是否正確
- 測試所有功能在生產環境中的表現 