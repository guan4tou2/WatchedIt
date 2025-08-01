# 🚀 WatchedIt 生產模式部署指南

本指南將幫助您將 WatchedIt 部署到生產環境，包括多種部署選項和最佳實踐。

## 📋 部署選項概覽

### 1. 靜態網站部署（推薦）
- **適用場景**: 純前端應用，使用瀏覽器本地儲存
- **優勢**: 成本低、速度快、易於維護
- **平台**: Vercel、Netlify、GitHub Pages、Cloudflare Pages

### 2. 全棧應用部署
- **適用場景**: 需要後端 API 支援
- **優勢**: 功能完整、數據持久化
- **平台**: Railway、Render、Heroku、DigitalOcean

### 3. 容器化部署
- **適用場景**: 需要完全控制部署環境
- **優勢**: 環境一致、易於擴展
- **平台**: Docker、Kubernetes

## 🎯 推薦部署方案

### 方案一：Vercel 部署（最簡單）

```bash
# 1. 安裝 Vercel CLI
npm i -g vercel

# 2. 登入 Vercel
vercel login

# 3. 部署前端
cd frontend
vercel --prod

# 4. 部署後端（可選）
cd ../backend
vercel --prod
```

**優點**:
- 零配置部署
- 自動 HTTPS
- 全球 CDN
- 自動構建和部署
- 免費額度充足

### 方案二：Netlify 部署

```bash
# 1. 構建前端
cd frontend
npm run build

# 2. 部署到 Netlify
netlify deploy --prod --dir=out
```

**優點**:
- 簡單易用
- 自動 HTTPS
- 表單處理
- 函數支援

### 方案三：Docker 部署

```bash
# 1. 構建並啟動所有服務
docker-compose up -d --build

# 2. 查看服務狀態
docker-compose ps

# 3. 查看日誌
docker-compose logs -f
```

**優點**:
- 環境一致
- 易於擴展
- 完整控制

## 🔧 生產環境配置

### 環境變數配置

創建 `.env.production` 文件：

```bash
# 前端環境變數
NEXT_PUBLIC_API_URL=https://your-api-domain.com
NEXT_PUBLIC_APP_URL=https://your-app-domain.com

# 後端環境變數
DATABASE_URL=your-database-url
SECRET_KEY=your-secret-key
CORS_ORIGINS=https://your-app-domain.com
```

### 安全配置

1. **HTTPS 強制**
```javascript
// next.config.js
const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains'
          }
        ]
      }
    ]
  }
}
```

2. **CORS 配置**
```python
# backend/app/main.py
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://your-app-domain.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### 性能優化

1. **前端優化**
```javascript
// next.config.js
const nextConfig = {
  compress: true,
  poweredByHeader: false,
  generateEtags: false,
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['lucide-react']
  }
}
```

2. **後端優化**
```python
# backend/app/main.py
from fastapi import FastAPI
from fastapi.middleware.gzip import GZipMiddleware

app = FastAPI(title="WatchedIt API")
app.add_middleware(GZipMiddleware, minimum_size=1000)
```

## 📊 監控和分析

### 前端監控

1. **錯誤追蹤**
```bash
npm install @sentry/nextjs
```

2. **性能監控**
```bash
npm install @vercel/analytics
```

### 後端監控

1. **日誌配置**
```python
import logging
from fastapi import FastAPI

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
```

2. **健康檢查**
```python
@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now()}
```

## 🔄 CI/CD 配置

### GitHub Actions 生產部署

```yaml
# .github/workflows/production-deploy.yml
name: Production Deploy

on:
  push:
    tags: ['v*']

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Build application
        run: npm run build
        
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

## 🚨 故障排除

### 常見問題

1. **構建失敗**
   - 檢查 Node.js 版本
   - 清理 node_modules 和重新安裝
   - 檢查環境變數配置

2. **部署失敗**
   - 檢查域名配置
   - 確認 SSL 證書
   - 查看部署日誌

3. **性能問題**
   - 啟用 CDN
   - 優化圖片和資源
   - 使用緩存策略

### 日誌查看

```bash
# Vercel
vercel logs

# Netlify
netlify logs

# Docker
docker-compose logs -f
```

## 📈 擴展建議

### 數據庫選擇

1. **SQLite** (開發/小規模)
   - 簡單易用
   - 無需額外服務

2. **PostgreSQL** (生產推薦)
   - 功能完整
   - 性能優異
   - 支援複雜查詢

3. **MongoDB** (文檔型數據)
   - 靈活的數據結構
   - 易於擴展

### 緩存策略

1. **Redis** (會話/緩存)
2. **CDN** (靜態資源)
3. **瀏覽器緩存** (前端資源)

## 🔐 安全檢查清單

- [ ] HTTPS 強制啟用
- [ ] 環境變數安全配置
- [ ] CORS 正確設置
- [ ] 輸入驗證和清理
- [ ] 錯誤信息不暴露敏感數據
- [ ] 定期更新依賴
- [ ] 監控和日誌配置
- [ ] 備份策略

## 📞 支援

如果遇到部署問題，請：

1. 檢查本指南的故障排除部分
2. 查看相關平台的官方文檔
3. 在 GitHub Issues 中提出問題

---

**注意**: 生產部署前請務必在測試環境中充分測試所有功能。 