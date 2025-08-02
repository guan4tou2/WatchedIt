# 🚀 WatchedIt 部署指南

## 📋 目錄

- [快速開始](#快速開始)
- [部署方式](#部署方式)
- [環境配置](#環境配置)
- [生產環境](#生產環境)
- [監控維護](#監控維護)
- [故障排除](#故障排除)
- [最佳實踐](#最佳實踐)
- [安全指南](#安全指南)

## 🎯 快速開始

### 方式一：Vercel 部署（推薦）

```bash
# 1. 安裝 Vercel CLI
npm i -g vercel

# 2. 登入 Vercel
vercel login

# 3. 部署到 Vercel
cd frontend
vercel --prod
```

**優點**：
- ✅ 零配置部署
- ✅ 自動 HTTPS
- ✅ 全球 CDN
- ✅ 免費額度充足
- ✅ 自動 CI/CD

### 方式二：Netlify 部署

```bash
# 1. 構建專案
cd frontend
npm run build

# 2. 部署到 Netlify
netlify deploy --prod --dir=out
```

### 方式三：Docker 部署

```bash
# 1. 構建 Docker 映像
docker-compose -f docker-compose.prod.yml up -d --build

# 2. 查看服務狀態
docker-compose ps
```

## 🛠️ 部署方式詳解

### Vercel 部署

#### 自動部署
1. **連接 GitHub Repository**
   - 在 Vercel 控制台連接 GitHub
   - 選擇 `guan4tou2/WatchedIt` repository
   - 設定根目錄為 `frontend`

2. **環境變數設定**
   ```env
   NEXT_PUBLIC_API_URL=https://your-api.com
   NEXT_PUBLIC_APP_NAME=WatchedIt
   ```

3. **建置設定**
   - **Framework Preset**: Next.js
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
   - **Install Command**: `npm install`

#### 手動部署
```bash
# 1. 克隆專案
git clone https://github.com/guan4tou2/WatchedIt.git
cd WatchedIt

# 2. 安裝依賴
cd frontend
npm install

# 3. 部署
vercel --prod
```

### Netlify 部署

#### 自動部署
1. **連接 GitHub**
   - 在 Netlify 控制台連接 GitHub
   - 選擇 repository
   - 設定建置命令：`cd frontend && npm run build`
   - 設定發布目錄：`frontend/out`

#### 手動部署
```bash
# 1. 構建專案
cd frontend
npm run build

# 2. 部署
netlify deploy --prod --dir=out
```

### Docker 部署

#### 開發環境
```bash
# 啟動所有服務
docker-compose up -d

# 查看日誌
docker-compose logs -f
```

#### 生產環境
```bash
# 使用生產配置
docker-compose -f docker-compose.prod.yml up -d

# 查看服務狀態
docker-compose ps
```

## ⚙️ 環境配置

### 前端環境變數

創建 `.env.local` 檔案：

```env
# API 配置
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_APP_NAME=WatchedIt

# 功能開關
NEXT_PUBLIC_ENABLE_ANILIST=true
NEXT_PUBLIC_ENABLE_CLOUD_SYNC=true

# 分析工具
NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=your-ga-id
NEXT_PUBLIC_VERCEL_ANALYTICS_ID=your-vercel-id
```

### 後端環境變數

創建 `.env` 檔案：

```env
# 資料庫配置
DATABASE_URL=sqlite:///./watchedit.db

# API 配置
API_HOST=0.0.0.0
API_PORT=8000

# 安全配置
SECRET_KEY=your-secret-key
CORS_ORIGINS=http://localhost:3000,https://your-domain.com

# 雲端同步配置
CLOUD_ENDPOINT=https://your-cloud-api.com
CLOUD_API_KEY=your-api-key
```

## 🏭 生產環境

### 域名配置

#### 自定義域名
1. **購買域名**
   - 推薦：Namecheap、GoDaddy、Cloudflare
   - 設定 DNS 記錄指向 Vercel/Netlify

2. **SSL 證書**
   - Vercel/Netlify 自動提供 SSL
   - 確保 HTTPS 強制啟用

#### 子域名配置
```bash
# 範例 DNS 記錄
watchedit.yourdomain.com  CNAME  your-vercel-app.vercel.app
api.yourdomain.com        CNAME  your-api-domain.com
```

### 性能優化

#### 前端優化
```javascript
// next.config.js
module.exports = {
  // 啟用圖片優化
  images: {
    domains: ['your-image-domain.com'],
    formats: ['image/webp', 'image/avif'],
  },
  
  // 啟用壓縮
  compress: true,
  
  // 啟用 PWA
  experimental: {
    pwa: true,
  },
}
```

#### 後端優化
```python
# 啟用 Gzip 壓縮
from fastapi.middleware.gzip import GZipMiddleware
app.add_middleware(GZipMiddleware)

# 啟用快取
from fastapi.middleware.cors import CORSMiddleware
app.add_middleware(CORSMiddleware, allow_origins=["*"])
```

### 安全配置

#### HTTPS 強制
```javascript
// middleware.js
export function middleware(request) {
  if (process.env.NODE_ENV === 'production') {
    const url = request.nextUrl.clone()
    if (url.protocol === 'http:') {
      url.protocol = 'https:'
      return NextResponse.redirect(url)
    }
  }
}
```

#### 安全標頭
```javascript
// next.config.js
const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on'
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload'
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
]
```

## 📊 監控維護

### 性能監控

#### Vercel Analytics
```javascript
// 在 _app.js 中添加
import { Analytics } from '@vercel/analytics/react'

export default function App({ Component, pageProps }) {
  return (
    <>
      <Component {...pageProps} />
      <Analytics />
    </>
  )
}
```

#### 錯誤追蹤
```javascript
// 添加 Sentry
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
})
```

### 日誌管理

#### 前端日誌
```javascript
// 自定義日誌
const logger = {
  info: (message, data) => {
    console.log(`[INFO] ${message}`, data)
    // 發送到日誌服務
  },
  error: (message, error) => {
    console.error(`[ERROR] ${message}`, error)
    // 發送到錯誤追蹤服務
  }
}
```

#### 後端日誌
```python
import logging

# 配置日誌
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

logger = logging.getLogger(__name__)
```

### 健康檢查

#### 前端健康檢查
```javascript
// pages/api/health.js
export default function handler(req, res) {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version
  })
}
```

#### 後端健康檢查
```python
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "version": "1.0.0"
    }
```

## 🔧 故障排除

### 常見問題

#### 1. 建置失敗
```bash
# 清除快取
rm -rf .next node_modules
npm install
npm run build
```

#### 2. 部署失敗
```bash
# 檢查環境變數
vercel env ls

# 重新部署
vercel --prod --force
```

#### 3. 性能問題
```bash
# 分析打包大小
npm run build
# 查看 .next/analyze 目錄
```

#### 4. 資料庫問題
```bash
# 重置資料庫
rm watchedit.db
uvicorn app.main:app --reload
```

### 調試工具

#### 前端調試
```bash
# 開發模式
npm run dev

# 生產模式本地測試
npm run build
npm run start
```

#### 後端調試
```bash
# 開發模式
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# 生產模式
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

### 支援資源

- **GitHub Issues**: https://github.com/guan4tou2/WatchedIt/issues
- **Vercel 文檔**: https://vercel.com/docs
- **Next.js 文檔**: https://nextjs.org/docs
- **FastAPI 文檔**: https://fastapi.tiangolo.com

## 📞 聯繫支援

如果您遇到部署問題，請：

1. **檢查日誌**: 查看 Vercel/Netlify 部署日誌
2. **提交 Issue**: 在 GitHub 提交詳細的錯誤報告
3. **查看文檔**: 參考相關技術文檔
4. **社群支援**: 在 GitHub Discussions 尋求幫助

## 🏆 最佳實踐

### 部署策略

#### 藍綠部署
```bash
# 準備新版本
git checkout -b release/v1.1.0
npm run build
vercel --prod

# 測試新版本
# 確認無問題後切換流量
```

#### 金絲雀部署
```javascript
// 使用 Vercel 的 Preview Deployments
// 在生產環境中逐步釋出新功能
```

#### 回滾策略
```bash
# 快速回滾到上一個版本
vercel --prod --force

# 或使用特定版本
vercel --prod --force --version=previous
```

### 性能優化

#### 前端優化
```javascript
// next.config.js
module.exports = {
  // 啟用圖片優化
  images: {
    domains: ['your-image-domain.com'],
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  
  // 啟用壓縮
  compress: true,
  
  // 啟用 PWA
  experimental: {
    pwa: true,
  },
  
  // 優化打包
  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      config.optimization.splitChunks.cacheGroups = {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
        },
      }
    }
    return config
  },
}
```

#### 後端優化
```python
# 啟用 Gzip 壓縮
from fastapi.middleware.gzip import GZipMiddleware
app.add_middleware(GZipMiddleware)

# 啟用快取
from fastapi.middleware.cors import CORSMiddleware
app.add_middleware(CORSMiddleware, allow_origins=["*"])

# 資料庫連接池
from sqlalchemy import create_engine
from sqlalchemy.pool import QueuePool

engine = create_engine(
    DATABASE_URL,
    poolclass=QueuePool,
    pool_size=20,
    max_overflow=30,
    pool_pre_ping=True,
)
```

### 監控策略

#### 應用性能監控 (APM)
```javascript
// 使用 Sentry 進行錯誤追蹤
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
  integrations: [
    new Sentry.BrowserTracing({
      tracePropagationTargets: ['localhost', 'your-domain.com'],
    }),
  ],
})
```

#### 用戶行為分析
```javascript
// 使用 Vercel Analytics
import { Analytics } from '@vercel/analytics/react'

export default function App({ Component, pageProps }) {
  return (
    <>
      <Component {...pageProps} />
      <Analytics />
    </>
  )
}
```

#### 健康檢查
```javascript
// pages/api/health.js
export default function handler(req, res) {
  const healthcheck = {
    uptime: process.uptime(),
    message: 'OK',
    timestamp: Date.now(),
    version: process.env.npm_package_version,
    environment: process.env.NODE_ENV,
  }
  
  try {
    res.status(200).json(healthcheck)
  } catch (error) {
    healthcheck.message = error
    res.status(503).json(healthcheck)
  }
}
```

## 🔒 安全指南

### 安全配置

#### HTTPS 強制
```javascript
// middleware.js
import { NextResponse } from 'next/server'

export function middleware(request) {
  if (process.env.NODE_ENV === 'production') {
    const url = request.nextUrl.clone()
    if (url.protocol === 'http:') {
      url.protocol = 'https:'
      return NextResponse.redirect(url)
    }
  }
  return NextResponse.next()
}

export const config = {
  matcher: '/((?!api|_next/static|_next/image|favicon.ico).*)',
}
```

#### 安全標頭
```javascript
// next.config.js
const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on'
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload'
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'Referrer-Policy',
    value: 'origin-when-cross-origin'
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()'
  }
]

module.exports = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ]
  },
}
```

#### 環境變數安全
```bash
# .env.production
# 使用強密碼和隨機字串
SECRET_KEY=your-super-secret-key-here
DATABASE_URL=postgresql://user:password@localhost/dbname
API_KEY=your-api-key-here

# 不要將敏感資訊提交到 Git
# 使用環境變數管理工具
```

### 資料安全

#### 資料加密
```javascript
// 敏感資料加密
import crypto from 'crypto'

const algorithm = 'aes-256-cbc'
const secretKey = process.env.ENCRYPTION_KEY

function encrypt(text) {
  const iv = crypto.randomBytes(16)
  const cipher = crypto.createCipher(algorithm, secretKey)
  let encrypted = cipher.update(text, 'utf8', 'hex')
  encrypted += cipher.final('hex')
  return iv.toString('hex') + ':' + encrypted
}

function decrypt(text) {
  const textParts = text.split(':')
  const iv = Buffer.from(textParts.shift(), 'hex')
  const encryptedText = textParts.join(':')
  const decipher = crypto.createDecipher(algorithm, secretKey)
  let decrypted = decipher.update(encryptedText, 'hex', 'utf8')
  decrypted += decipher.final('utf8')
  return decrypted
}
```

#### 輸入驗證
```javascript
// 前端輸入驗證
const validateInput = (input) => {
  const sanitized = input.replace(/[<>]/g, '')
  return sanitized.length <= 1000
}

// 後端輸入驗證
from pydantic import BaseModel, validator

class WorkCreate(BaseModel):
    title: str
    type: str
    status: str
    
    @validator('title')
    def validate_title(cls, v):
        if len(v) > 100:
            raise ValueError('Title too long')
        return v.strip()
```

### 存取控制

#### API 認證
```python
# 使用 JWT 進行 API 認證
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import jwt

security = HTTPBearer()

async def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=["HS256"])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")
```

#### 速率限制
```python
# 使用 FastAPI 的速率限制
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

@app.get("/api/works")
@limiter.limit("10/minute")
async def get_works(request: Request):
    return {"works": []}
```

### 安全監控

#### 日誌監控
```python
# 結構化日誌
import logging
import json
from datetime import datetime

class JSONFormatter(logging.Formatter):
    def format(self, record):
        log_entry = {
            'timestamp': datetime.utcnow().isoformat(),
            'level': record.levelname,
            'message': record.getMessage(),
            'module': record.module,
            'function': record.funcName,
            'line': record.lineno,
        }
        return json.dumps(log_entry)

# 配置日誌
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('app.log'),
        logging.StreamHandler()
    ]
)
```

#### 安全掃描
```bash
# 使用 npm audit 檢查依賴漏洞
npm audit

# 使用 Snyk 進行安全掃描
npx snyk test

# 使用 OWASP ZAP 進行滲透測試
docker run -v $(pwd):/zap/wrk/:rw -t owasp/zap2docker-stable zap-baseline.py -t https://your-domain.com
```

---

**最後更新**: 2024年8月
**版本**: 1.0.0 