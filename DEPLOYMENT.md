# WatchedIt 部署指南

## 🎉 概述

WatchedIt 是一個用於記錄和管理看過的動畫、電影、電視劇、小說等作品的 Web 應用程序。本專案已配置為自動部署到 GitHub Pages。

## 📋 技術架構

### 前端技術棧
- **Next.js 14** - React 框架
- **TypeScript** - 類型安全
- **Tailwind CSS** - 樣式框架
- **Zustand** - 狀態管理
- **IndexedDB** - 本地數據存儲
- **PWA** - 漸進式 Web 應用

### 後端技術棧
- **FastAPI** - Python Web 框架
- **SQLite** - 數據庫
- **Docker** - 容器化部署

## 🚀 GitHub Pages 部署

### 已完成的配置

#### 1. Next.js 配置
- ✅ 添加了 GitHub Pages 的 basePath 配置
- ✅ 設置了 assetPrefix 以支援靜態資源
- ✅ 配置了 trailingSlash 以確保路由正確
- ✅ 設置了 images.unoptimized 以支援圖片

#### 2. 路由處理
- ✅ 創建了 `getFullPath()` 工具函數
- ✅ 更新了所有 Link 組件使用 `getFullPath()`
- ✅ 修改了所有 router.push() 調用
- ✅ 更新了 Logo 組件

#### 3. GitHub Actions 工作流程
- ✅ 創建了 `.github/workflows/deploy.yml`
- ✅ 配置了自動構建和部署
- ✅ 設置了 Node.js 18 環境
- ✅ 配置了靜態文件導出

#### 4. 部署腳本
- ✅ 創建了 `deploy.sh` 腳本
- ✅ 添加了執行權限

### 部署步驟

#### 1. 推送代碼到 GitHub
```bash
git add .
git commit -m "feat: 配置 GitHub Pages 部署"
git push origin main
```

#### 2. 啟用 GitHub Pages
1. 前往您的 GitHub 倉庫
2. 點擊 "Settings" 標籤
3. 在左側菜單中找到 "Pages"
4. 在 "Source" 部分選擇 "Deploy from a branch"
5. 選擇 "gh-pages" 分支和 "/ (root)" 文件夾
6. 點擊 "Save"

#### 3. 配置 GitHub Actions 權限
1. 在倉庫的 "Settings" 頁面
2. 點擊 "Actions" > "General"
3. 在 "Workflow permissions" 部分選擇 "Read and write permissions"
4. 點擊 "Save"

#### 4. 監控部署
1. 前往倉庫的 "Actions" 標籤
2. 查看 "Deploy to GitHub Pages" 工作流程
3. 等待構建完成

### 訪問地址

部署完成後，您的應用程序將在以下地址可用：

- **GitHub Pages URL**: `https://[您的用戶名].github.io/WatchedIt/`
- **自定義域名** (如果配置): `https://watchedit.app`

## 🔧 技術配置

### Next.js 配置
```javascript
// next.config.js
{
  basePath: process.env.NODE_ENV === 'production' ? '/WatchedIt' : '',
  assetPrefix: process.env.NODE_ENV === 'production' ? '/WatchedIt/' : '',
  trailingSlash: true,
  output: 'standalone',
  images: {
    unoptimized: true,
  }
}
```

### 路由處理
```typescript
// lib/utils.ts
export function getFullPath(path: string): string {
  const basePath = getBasePath();
  return `${basePath}${path}`;
}

export function getBasePath(): string {
  return process.env.NODE_ENV === 'production' ? '/WatchedIt' : '';
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

## 🐳 Docker 部署

### 本地開發
```bash
# 啟動所有服務
docker-compose up -d

# 查看日誌
docker-compose logs -f

# 停止服務
docker-compose down
```

### 生產部署
```bash
# 構建並啟動
docker-compose -f docker-compose.yml up -d --build

# 更新部署
docker-compose -f docker-compose.yml up -d --build --force-recreate
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

### 本地測試

```bash
# 前端開發
cd frontend
npm run dev

# 前端生產構建測試
npm run build
npm run start

# 後端開發
cd backend
uvicorn app.main:app --reload

# 後端測試
pytest
```

## 📞 支援

如果遇到問題，請檢查：

1. **GitHub Actions 日誌** - 查看構建和部署過程
2. **瀏覽器控制台錯誤** - 檢查前端 JavaScript 錯誤
3. **網絡連接和 DNS 設置** - 確認域名解析
4. **Docker 日誌** - 查看容器運行狀態

## 🎯 下一步

1. 推送代碼到 GitHub
2. 監控 GitHub Actions 部署
3. 測試生產環境功能
4. 配置自定義域名（可選）
5. 設置監控和日誌收集
6. 配置 CI/CD 流程

## 📚 相關文檔

- [Next.js 文檔](https://nextjs.org/docs)
- [FastAPI 文檔](https://fastapi.tiangolo.com/)
- [GitHub Pages 文檔](https://pages.github.com/)
- [Docker 文檔](https://docs.docker.com/)

祝您部署順利！🎉 