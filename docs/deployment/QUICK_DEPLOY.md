# ⚡ WatchedIt 快速部署指南

## 🎯 5分鐘快速部署

### 方式一：Vercel 一鍵部署（推薦）

**最簡單的方式，適合大多數使用者**

1. **準備專案**
   ```bash
   # 克隆專案
   git clone https://github.com/guantou/WatchedIt.git
   cd WatchedIt
   ```

2. **安裝 Vercel CLI**
   ```bash
   npm i -g vercel
   ```

3. **登入 Vercel**
   ```bash
   vercel login
   ```

4. **部署到 Vercel**
   ```bash
   cd frontend
   vercel --prod
   ```

5. **完成！**
   - 系統會自動分配一個域名
   - 例如：`https://watchedit-xxx.vercel.app`
   - 可以自定義域名

### 方式二：GitHub + Vercel 自動部署

**適合有 GitHub 帳號的使用者**

1. **Fork 專案**
   - 前往 https://github.com/guantou/WatchedIt
   - 點擊右上角的 "Fork" 按鈕

2. **連接 Vercel**
   - 前往 https://vercel.com
   - 使用 GitHub 帳號登入
   - 點擊 "New Project"

3. **選擇專案**
   - 選擇 `WatchedIt` repository
   - 設定根目錄為 `frontend`
   - 點擊 "Deploy"

4. **完成！**
   - 系統會自動部署並提供域名
   - 每次推送到 GitHub 都會自動重新部署

### 方式三：Netlify 部署

**適合喜歡 Netlify 的使用者**

1. **準備專案**
   ```bash
   git clone https://github.com/guantou/WatchedIt.git
   cd WatchedIt/frontend
   ```

2. **構建專案**
   ```bash
   npm install
   npm run build
   ```

3. **部署到 Netlify**
   ```bash
   # 安裝 Netlify CLI
   npm i -g netlify-cli
   
   # 部署
   netlify deploy --prod --dir=out
   ```

## ⚙️ 基本配置

### 環境變數設定

創建 `.env.local` 檔案（可選）：

```env
# 應用名稱
NEXT_PUBLIC_APP_NAME=WatchedIt

# API 配置（如果使用後端）
NEXT_PUBLIC_API_URL=https://your-api.com

# 功能開關
NEXT_PUBLIC_ENABLE_ANILIST=true
NEXT_PUBLIC_ENABLE_CLOUD_SYNC=false
```

### 自定義域名

#### Vercel 自定義域名
1. 在 Vercel 控制台選擇專案
2. 點擊 "Settings" → "Domains"
3. 添加自定義域名
4. 設定 DNS 記錄指向 Vercel

#### Netlify 自定義域名
1. 在 Netlify 控制台選擇專案
2. 點擊 "Domain settings"
3. 添加自定義域名
4. 設定 DNS 記錄指向 Netlify

## 🔧 進階配置

### 啟用 PWA 功能

PWA 功能預設已啟用，包括：
- 離線使用
- 安裝到桌面
- 推送通知（可選）

### 啟用分析工具

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

### 啟用錯誤追蹤

```javascript
// 安裝 Sentry
npm install @sentry/nextjs

// 在 sentry.client.config.js 中配置
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
})
```

## 📱 安裝到設備

部署完成後，使用者可以將應用安裝到設備：

### Android
1. 使用 Chrome 瀏覽器訪問應用
2. 點擊瀏覽器選單中的「安裝應用程式」
3. 確認安裝

### iOS
1. 使用 Safari 瀏覽器訪問應用
2. 點擊分享按鈕
3. 選擇「添加到主畫面」

### Windows/macOS
1. 使用支援的瀏覽器訪問應用
2. 點擊安裝按鈕或使用分享功能
3. 應用會出現在桌面或 Dock

## 🚀 生產環境優化

### 性能優化

```javascript
// next.config.js
module.exports = {
  // 啟用圖片優化
  images: {
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

### 安全配置

```javascript
// middleware.js
import { NextResponse } from 'next/server'

export function middleware(request) {
  // 強制 HTTPS
  if (process.env.NODE_ENV === 'production') {
    const url = request.nextUrl.clone()
    if (url.protocol === 'http:') {
      url.protocol = 'https:'
      return NextResponse.redirect(url)
    }
  }
  return NextResponse.next()
}
```

## 🔍 故障排除

### 常見問題

#### 部署失敗
```bash
# 清除快取重新部署
rm -rf .next node_modules
npm install
vercel --prod --force
```

#### 建置錯誤
```bash
# 檢查 Node.js 版本
node --version  # 需要 18+ 版本

# 清除快取
npm cache clean --force
rm -rf .next
npm install
npm run build
```

#### 環境變數問題
```bash
# 檢查環境變數
vercel env ls

# 設定環境變數
vercel env add NEXT_PUBLIC_APP_NAME
```

### 效能問題

#### 載入速度慢
- 檢查圖片是否過大
- 啟用圖片優化
- 使用 CDN

#### 建置時間長
- 使用 Vercel 的快取功能
- 優化依賴包大小
- 使用增量建置

## 📞 支援

如果遇到問題：

1. **查看日誌**: 在 Vercel/Netlify 控制台查看部署日誌
2. **檢查文檔**: 參考 [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)
3. **提交 Issue**: 在 GitHub 提交問題
4. **社群支援**: 在 GitHub Discussions 尋求幫助

---

**部署時間**: 約 5-10 分鐘  
**維護難度**: ⭐☆☆☆☆ (非常簡單)  
**推薦程度**: ⭐⭐⭐⭐⭐ (最推薦) 