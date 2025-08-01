# 🚀 WatchedIt 部署指南

本指南將幫助您將 WatchedIt 部署到生產環境，包括多種部署選項和最佳實踐。

## 📋 部署選項概覽

### 1. 靜態網站部署（推薦）
- **適用場景**: 純前端應用，使用瀏覽器本地儲存
- **優勢**: 成本低、速度快、易於維護
- **平台**: Vercel、Netlify、Cloudflare Pages

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

#### 純前端模式（推薦）

如果您只需要本地儲存功能，不需要後端 API：

1. **在 Vercel 專案設定中新增環境變數**：
   ```
   NEXT_PUBLIC_API_URL=
   ```

2. **或者不設定任何 API URL**，應用程式會自動使用本地儲存模式。

#### 完整模式（有後端）

如果您需要完整的 API 功能：

**選項 A：使用 Railway 部署後端**

1. **部署後端到 Railway**：
   ```bash
   cd backend
   # 使用 Railway CLI 或 GitHub 整合部署
   ```

2. **在 Vercel 中設定環境變數**：
   ```
   NEXT_PUBLIC_API_URL=https://your-backend.railway.app
   ```

**選項 B：使用 Render 部署後端**

1. **部署後端到 Render**：
   - 連接 GitHub 倉庫
   - 設定 Build Command: `pip install -r requirements.txt`
   - 設定 Start Command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

2. **在 Vercel 中設定環境變數**：
   ```
   NEXT_PUBLIC_API_URL=https://your-backend.onrender.com
   ```

**選項 C：使用 Vercel 部署後端**

1. **在 Vercel 中部署後端**：
   - 創建新的 Vercel 專案
   - 選擇 backend 目錄
   - 設定 Python 環境

2. **設定環境變數**：
   ```
   NEXT_PUBLIC_API_URL=https://your-backend.vercel.app
   ```

#### Vercel 部署步驟

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

#### 開發環境
```env
# 本地開發
NEXT_PUBLIC_API_URL=http://localhost:8000
```

#### 生產環境（純前端）
```env
# 不設定或設為空值
NEXT_PUBLIC_API_URL=
```

#### 生產環境（有後端）
```env
# 指向您的後端服務
NEXT_PUBLIC_API_URL=https://your-backend-domain.com
```

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

## 功能對比

### 純前端模式
- ✅ 本地儲存功能
- ✅ 作品管理
- ✅ 標籤管理
- ✅ 統計分析
- ❌ AniList 搜尋功能
- ❌ 雲端同步

### 完整模式（有後端）
- ✅ 所有功能
- ✅ AniList 搜尋
- ✅ 雲端同步
- ✅ 備份還原

## 🚨 常見問題與解決方案

### 1. API 連接問題

**問題**: API 請求仍然指向 `localhost:8000`

**解決方案**:
1. 確保環境變數正確設定
2. 重新構建和部署應用
3. 清除瀏覽器快取

### 2. 構建失敗

**問題**: 構建過程中出現錯誤

**解決方案**:
1. 檢查 Node.js 版本（建議 18+）
2. 清除 node_modules 並重新安裝
3. 檢查依賴版本衝突

### 3. 部署後功能異常

**問題**: 部署後某些功能不工作

**解決方案**:
1. 檢查環境變數設定
2. 查看部署日誌
3. 確認 API 端點可訪問

## 📊 監控與維護

### 健康檢查

設定健康檢查端點：

```typescript
// 前端健康檢查
export async function GET() {
  return Response.json({ status: 'ok', timestamp: new Date().toISOString() });
}
```

### 日誌監控

- 使用 Vercel Analytics 監控應用性能
- 設定錯誤追蹤（如 Sentry）
- 定期檢查部署日誌

### 備份策略

- 定期備份資料庫
- 使用 Git 版本控制
- 設定自動備份流程

## 🔗 相關資源

- [Vercel 文檔](https://vercel.com/docs)
- [Netlify 文檔](https://docs.netlify.com)
- [Docker 文檔](https://docs.docker.com)
- [Next.js 部署指南](https://nextjs.org/docs/deployment) 