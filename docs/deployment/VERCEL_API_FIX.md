# Vercel API 問題修復

## 問題描述

在 Vercel 部署的應用程式中，API 請求仍然指向 `localhost:8000`，導致以下錯誤：

```
GET http://localhost:8000/search/anime?query=%E6%AD%BB net::ERR_CONNECTION_REFUSED
AniList API error: TypeError: Failed to fetch
```

## 根本原因

1. **配置邏輯問題**：動態配置系統沒有正確處理 Vercel 部署環境
2. **API 代理問題**：當沒有外部後端服務時，API 代理會產生循環引用
3. **錯誤處理不完善**：沒有提供清晰的錯誤訊息和解決方案

## 解決方案

### 1. 改進配置邏輯

**修改檔案**：`frontend/src/lib/config.ts`

```typescript
// 動態獲取 API 基礎 URL
export const getApiBaseUrl = (): string => {
  // 1. 檢查環境變數
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }

  // 2. 在瀏覽器環境中，使用當前網址的 API 路徑
  if (typeof window !== "undefined") {
    const currentOrigin = window.location.origin;
    // 如果是本地開發環境，使用 localhost:8000
    if (
      currentOrigin.includes("localhost") ||
      currentOrigin.includes("127.0.0.1") ||
      currentOrigin.includes("localhost:3000")
    ) {
      return "http://localhost:8000";
    }
    // 生產環境使用相對路徑
    return "/api";
  }

  // 3. 在伺服器端渲染時，根據環境變數判斷
  if (process.env.NODE_ENV === "production") {
    return "/api";
  }

  // 4. 預設值
  return "http://localhost:8000";
};
```

### 2. 改進 API 代理錯誤處理

**修改檔案**：`frontend/src/app/api/[...path]/route.ts`

```typescript
// 如果 baseUrl 是相對路徑，表示沒有外部後端服務
if (baseUrl === "/api") {
  return NextResponse.json(
    {
      error: "API 端點未配置",
      message: "請設定 NEXT_PUBLIC_API_URL 環境變數或部署後端服務。目前僅支援本地儲存模式。",
    },
    { status: 503 }
  );
}
```

### 3. 改進錯誤處理

**修改檔案**：`frontend/src/components/AniListSearch.tsx`

```typescript
const searchAnime = useCallback(async (term: string) => {
  // ... 其他程式碼 ...
  
  try {
    const results = await anilistService.searchAnime(term, 1, 10);
    setSearchResults(results);
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "搜尋失敗";
    
    // 檢查是否是後端服務不可用的錯誤
    if (errorMessage.includes("API 端點未配置") || errorMessage.includes("Failed to fetch")) {
      setError("後端服務不可用。請設定 NEXT_PUBLIC_API_URL 環境變數或部署後端服務。目前僅支援本地儲存模式。");
    } else {
      setError(errorMessage);
    }
    
    setSearchResults([]);
  } finally {
    setIsLoading(false);
  }
}, []);
```

## 部署選項

### 選項一：純前端模式（推薦）

如果您只需要本地儲存功能：

1. **在 Vercel 專案設定中**：
   - 進入 Settings > Environment Variables
   - 新增 `NEXT_PUBLIC_API_URL` 並設為空值
   - 或者完全不設定這個環境變數

2. **重新部署**：
   ```bash
   vercel --prod
   ```

### 選項二：完整模式（有後端）

如果您需要 AniList 搜尋功能：

1. **部署後端服務**（選擇其一）：
   - Railway: `https://your-app.railway.app`
   - Render: `https://your-app.onrender.com`
   - Vercel: `https://your-backend.vercel.app`

2. **設定環境變數**：
   ```
   NEXT_PUBLIC_API_URL=https://your-backend-domain.com
   ```

3. **重新部署前端**：
   ```bash
   vercel --prod
   ```

## 功能對比

### 純前端模式
- ✅ 作品管理
- ✅ 標籤管理
- ✅ 統計分析
- ✅ 本地儲存
- ❌ AniList 搜尋
- ❌ 雲端同步

### 完整模式
- ✅ 所有功能
- ✅ AniList 搜尋
- ✅ 雲端同步
- ✅ 備份還原

## 測試方法

### 1. 檢查當前配置
訪問 `/test-config` 頁面查看：
- 當前 API URL
- 環境變數設定
- 瀏覽器 Origin

### 2. 測試 API 連接
在 `/test-config` 頁面點擊「測試 API 連接」按鈕

### 3. 測試 AniList 搜尋
嘗試搜尋動畫，查看錯誤訊息是否清晰

## 故障排除

### 常見問題

1. **環境變數未生效**
   - 重新部署應用程式
   - 清除瀏覽器快取
   - 檢查環境變數名稱

2. **API 仍然指向 localhost**
   - 確認環境變數已正確設定
   - 檢查部署是否成功
   - 查看 `/test-config` 頁面

3. **CORS 錯誤**
   - 確認後端 CORS 設定正確
   - 檢查 API URL 是否包含正確的協議

### 除錯步驟

1. **檢查環境變數**：
   ```bash
   # 在 Vercel 儀表板中查看
   Settings > Environment Variables
   ```

2. **查看部署日誌**：
   ```bash
   # 在 Vercel 儀表板中查看
   Functions > API Routes
   ```

3. **測試 API 端點**：
   ```bash
   curl https://your-backend-domain.com/health
   ```

## 最佳實踐

1. **開發環境**：使用 `http://localhost:8000`
2. **生產環境（純前端）**：不設定或設為空值
3. **生產環境（完整功能）**：指向實際的後端服務
4. **定期備份**：使用匯出功能備份重要資料
5. **監控錯誤**：定期檢查 Vercel 日誌

## 注意事項

- 純前端模式使用瀏覽器本地儲存，資料不會上傳到伺服器
- 清除瀏覽器資料會導致資料遺失
- 建議定期匯出資料備份
- 不同設備間資料不會自動同步（除非使用雲端模式） 