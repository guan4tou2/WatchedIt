# API URL 動態配置改進

## 問題描述

原本的應用程式使用硬編碼的 `localhost:8000` 作為 API 網址，這導致以下問題：

1. **開發環境問題**：當後端服務未運行時，會出現 `net::ERR_CONNECTION_REFUSED` 錯誤
2. **生產環境問題**：無法靈活配置不同的 API 網址
3. **部署困難**：需要手動修改程式碼來適應不同的部署環境

## 解決方案

### 1. 動態配置系統

創建了 `frontend/src/lib/config.ts` 檔案，實現了智能的 API URL 檢測：

```typescript
export const getApiBaseUrl = (): string => {
  // 1. 檢查環境變數
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }

  // 2. 在瀏覽器環境中，使用當前網址的 API 路徑
  if (typeof window !== "undefined") {
    const currentOrigin = window.location.origin;
    // 如果是本地開發環境，使用 localhost:8000
    if (currentOrigin.includes("localhost") || currentOrigin.includes("127.0.0.1")) {
      return "http://localhost:8000";
    }
    // 生產環境使用相對路徑
    return "/api";
  }

  // 3. 預設值
  return "http://localhost:8000";
};
```

### 2. API 代理系統

創建了 `frontend/src/app/api/[...path]/route.ts` 檔案，實現了完整的 API 代理：

- 支援所有 HTTP 方法（GET、POST、PUT、DELETE）
- 自動處理請求標頭和回應
- 錯誤處理和日誌記錄

### 3. 環境變數配置

提供了靈活的環境變數配置選項：

#### 開發環境
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

#### 生產環境（選項一：使用相對路徑）
```env
NEXT_PUBLIC_API_URL=
```

#### 生產環境（選項二：指定外部 API）
```env
NEXT_PUBLIC_API_URL=https://your-api-domain.com
```

### 4. 更新的檔案

1. **`frontend/src/lib/config.ts`** - 新的配置管理系統
2. **`frontend/src/lib/api.ts`** - 更新為使用動態配置
3. **`frontend/src/lib/anilist.ts`** - 更新為使用動態配置
4. **`frontend/next.config.js`** - 更新 API 代理配置
5. **`frontend/src/app/api/[...path]/route.ts`** - 新增 API 代理路由
6. **`frontend/env.example`** - 環境變數範例檔案
7. **`frontend/DEPLOYMENT.md`** - 部署指南
8. **`frontend/src/app/test-config/page.tsx`** - 配置測試頁面

## 使用方式

### 本地開發

1. 複製環境變數範例：
```bash
cp frontend/env.example frontend/.env.local
```

2. 啟動開發伺服器：
```bash
cd frontend
npm run dev
```

3. 訪問測試頁面：http://localhost:3000/test-config

### 生產部署

#### Vercel 部署
1. 在 Vercel 專案設定中新增環境變數（可選）
2. 部署時會自動使用相對路徑 `/api`

#### 自架伺服器
1. 設定環境變數指向您的 API 網址
2. 或使用相對路徑讓 Next.js 處理代理

## 優點

1. **靈活性**：支援多種部署環境和配置方式
2. **易用性**：無需修改程式碼即可適應不同環境
3. **可靠性**：提供完整的錯誤處理和日誌記錄
4. **可測試性**：包含完整的測試套件
5. **向後兼容**：不影響現有功能

## 測試

運行配置測試：
```bash
cd frontend
npm test -- --testPathPattern=config.test.ts
```

訪問測試頁面：
http://localhost:3000/test-config

## 故障排除

### 常見問題

1. **API 連接被拒絕**
   - 檢查後端服務是否正在運行
   - 確認環境變數配置是否正確

2. **環境變數未生效**
   - 重新啟動開發伺服器
   - 檢查 `.env.local` 檔案位置

3. **生產環境 API 錯誤**
   - 確認 API 代理路由是否正確配置
   - 檢查 Next.js 配置中的 rewrites 設定

### 除錯技巧

1. 訪問 `/test-config` 頁面查看當前配置
2. 檢查瀏覽器開發者工具的 Network 標籤
3. 查看瀏覽器控制台的錯誤訊息 