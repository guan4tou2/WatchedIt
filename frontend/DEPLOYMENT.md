# 部署指南

## 環境變數配置

### 開發環境

1. 複製環境變數範例檔案：
```bash
cp env.example .env.local
```

2. 編輯 `.env.local`：
```env
# 本地開發
NEXT_PUBLIC_API_URL=http://localhost:8000
NODE_ENV=development
```

### 生產環境

#### 選項一：使用相對路徑（推薦）

```env
# 使用相對路徑，讓 Next.js 處理 API 代理
NEXT_PUBLIC_API_URL=
NODE_ENV=production
```

#### 選項二：指定外部 API 網址

```env
# 指定外部 API 網址
NEXT_PUBLIC_API_URL=https://your-api-domain.com
NODE_ENV=production
```

## 部署平台

### Vercel 部署

1. 在 Vercel 專案設定中新增環境變數：
   - `NEXT_PUBLIC_API_URL`: 您的 API 網址（可選）
   - `NODE_ENV`: `production`

2. 部署設定：
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install`

### Netlify 部署

1. 在 Netlify 專案設定中新增環境變數
2. 設定 Build Command: `npm run build`
3. 設定 Publish Directory: `.next`

### 自架伺服器

1. 建置專案：
```bash
npm run build
```

2. 啟動生產伺服器：
```bash
npm start
```

## API 配置說明

### 動態 URL 檢測

應用程式會自動檢測並使用適當的 API URL：

1. **環境變數優先**：如果設定了 `NEXT_PUBLIC_API_URL`，會使用該值
2. **瀏覽器環境檢測**：
   - 本地開發：使用 `http://localhost:8000`
   - 生產環境：使用相對路徑 `/api`
3. **預設值**：`http://localhost:8000`

### API 代理

在生產環境中，Next.js 會自動代理 `/api/*` 請求到後端服務，無需額外配置。

## 故障排除

### 常見問題

1. **API 連接被拒絕**
   - 檢查後端服務是否正在運行
   - 確認 API URL 配置是否正確
   - 檢查防火牆設定

2. **CORS 錯誤**
   - 確保後端已正確設定 CORS
   - 檢查 API URL 是否包含正確的協議

3. **環境變數未生效**
   - 重新啟動開發伺服器
   - 檢查環境變數名稱是否正確
   - 確認 `.env.local` 檔案位置

### 除錯技巧

1. 檢查瀏覽器開發者工具的 Network 標籤
2. 查看瀏覽器控制台的錯誤訊息
3. 確認 API 請求的 URL 是否正確
4. 測試 API 端點是否可正常訪問 