# 功能改進說明

本文檔記錄了 WatchedIt 專案的重要功能改進，包括 API URL 動態配置和 UI 改進。

## 🔧 API URL 動態配置改進

### 問題描述

原本的應用程式使用硬編碼的 `localhost:8000` 作為 API 網址，這導致以下問題：

1. **開發環境問題**：當後端服務未運行時，會出現 `net::ERR_CONNECTION_REFUSED` 錯誤
2. **生產環境問題**：無法靈活配置不同的 API 網址
3. **部署困難**：需要手動修改程式碼來適應不同的部署環境

### 解決方案

#### 1. 動態配置系統

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

#### 2. API 代理系統

創建了 `frontend/src/app/api/[...path]/route.ts` 檔案，實現了完整的 API 代理：

- 支援所有 HTTP 方法（GET、POST、PUT、DELETE）
- 自動處理請求標頭和回應
- 錯誤處理和日誌記錄

#### 3. 環境變數配置

提供了靈活的環境變數配置選項：

**開發環境**
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

**生產環境（選項一：使用相對路徑）**
```env
NEXT_PUBLIC_API_URL=
```

**生產環境（選項二：指定外部 API）**
```env
NEXT_PUBLIC_API_URL=https://your-api-domain.com
```

### 更新的檔案

1. **`frontend/src/lib/config.ts`** - 新的配置管理系統
2. **`frontend/src/lib/api.ts`** - 更新為使用動態配置
3. **`frontend/src/lib/anilist.ts`** - 更新為使用動態配置
4. **`frontend/next.config.js`** - 更新 API 代理配置
5. **`frontend/src/app/api/[...path]/route.ts`** - 新增 API 代理路由
6. **`frontend/env.example`** - 環境變數範例檔案
7. **`frontend/src/app/test-config/page.tsx`** - 配置測試頁面

## 🎨 UI 改進

### 問題描述

1. **重要提醒的「不再提醒」功能失效**：用戶點擊「不再提醒」後，重新整理頁面仍然會顯示提醒
2. **教學說明按鈕位置不夠顯眼**：用戶不容易發現教學說明功能

### 解決方案

#### 1. 修復「不再提醒」功能

**問題原因**：
原本的「不再提醒」功能只是簡單地設定 `setShowDataReminder(false)`，但沒有將這個設定儲存到 localStorage 中，導致重新整理頁面後設定會重置。

**解決方案**：
- 使用 localStorage 來持久化「不再提醒」的設定
- 在組件初始化時檢查 localStorage 中的設定
- 點擊「不再提醒」時同時更新狀態和 localStorage

**修改的檔案**：
- `frontend/src/app/page.tsx`

**具體修改**：

```typescript
// 修改前
const [showDataReminder, setShowDataReminder] = useState(true);

// 修改後
const [showDataReminder, setShowDataReminder] = useState(() => {
  if (typeof window !== "undefined") {
    const dismissed = localStorage.getItem("watchedit_data_reminder_dismissed");
    return dismissed !== "true";
  }
  return true;
});

// 修改前
onClick={() => setShowDataReminder(false)}

// 修改後
onClick={() => {
  setShowDataReminder(false);
  localStorage.setItem("watchedit_data_reminder_dismissed", "true");
}}
```

#### 2. 調整教學說明按鈕位置

**問題原因**：
原本的教學說明按鈕位置不夠顯眼，用戶不容易發現這個重要功能。

**解決方案**：
- 將教學說明按鈕移到統計卡片的正下方
- 使用更顯眼的藍色主題樣式
- 移除重複的按鈕，避免混淆

**具體修改**：

```typescript
// 新的教學按鈕樣式
<Button
  variant="outline"
  onClick={() => setShowHelpGuide(true)}
  className="flex items-center space-x-2 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/30 border-blue-200 dark:border-blue-800"
>
  <HelpCircle className="w-4 h-4 text-blue-600 dark:text-blue-400" />
  <span className="text-blue-700 dark:text-blue-300">查看教學說明</span>
</Button>
```

## 📊 改進效果

### API URL 動態配置
- ✅ 支援多種部署環境
- ✅ 自動檢測開發/生產環境
- ✅ 靈活的環境變數配置
- ✅ 完整的 API 代理功能

### UI 改進
- ✅ 「不再提醒」功能正常工作
- ✅ 設定持久化儲存在瀏覽器中
- ✅ 教學說明按鈕位置更顯眼
- ✅ 支援深色模式
- ✅ 移除重複按鈕，避免混淆

## 🔧 技術細節

### localStorage 鍵名
- `watchedit_data_reminder_dismissed`: 儲存「不再提醒」的設定

### 樣式改進
- 使用 Tailwind CSS 的藍色主題
- 支援深色模式的顏色調整
- 保持與整體設計風格一致

### 效能優化
- 使用 `useState` 的函數初始化，避免不必要的重新渲染
- 只在瀏覽器環境中檢查 localStorage

## 🧪 測試方法

### API URL 配置測試
1. 訪問 http://localhost:3000/test-config
2. 檢查 API URL 配置是否正確
3. 測試不同環境變數設定

### UI 功能測試
1. 測試「不再提醒」功能
2. 重新整理頁面確認設定持久化
3. 檢查教學說明按鈕位置和樣式

## 📝 相關文件

- [部署指南](../deployment/DEPLOYMENT.md) - 詳細的部署說明
- [實現文檔](../implementation/README.md) - 技術實現細節 