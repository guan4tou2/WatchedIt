# 📱 PWA 安裝提示 - 首次使用功能

## 🎯 功能目標

實現 PWA 安裝提示只在首次使用時出現，避免重複打擾用戶。

## 🔧 實現方案

### 1. 本地儲存狀態管理

使用 localStorage 來記錄用戶的安裝狀態：

```javascript
// 檢查是否已經顯示過安裝提示
const hasShownInstallPrompt = localStorage.getItem("watchedit_install_prompt_shown");

// 檢查是否已經安裝過 PWA
const hasInstalledPWA = localStorage.getItem("watchedit_pwa_installed");
```

### 2. 條件顯示邏輯

只有在以下條件都滿足時才顯示安裝提示：
- 瀏覽器支援 PWA 安裝
- 用戶尚未安裝 PWA
- 用戶尚未看到過安裝提示

## 📝 修改內容

### 1. PWAInstall 組件修改

**檔案**: `frontend/src/components/PWAInstall.tsx`

#### 主要修改：

```diff
useEffect(() => {
+ // 檢查是否已經顯示過安裝提示或已安裝
+ const hasShownInstallPrompt = localStorage.getItem("watchedit_install_prompt_shown");
+ const hasInstalledPWA = localStorage.getItem("watchedit_pwa_installed");
+ 
+ // 如果已經安裝過，直接返回
+ if (hasInstalledPWA) {
+   return;
+ }

  // 監聽 beforeinstallprompt 事件
  const handleBeforeInstallPrompt = (e: Event) => {
    e.preventDefault();
    setDeferredPrompt(e);
    
+   // 只有在首次使用時才顯示安裝提示
+   if (!hasShownInstallPrompt) {
      setShowInstallPrompt(true);
+   }
  };
```

#### 安裝成功後標記：

```diff
const handleInstallClick = async () => {
  // ...
  if (outcome === "accepted") {
    console.log("User accepted the install prompt");
+   // 標記已安裝
+   localStorage.setItem("watchedit_pwa_installed", "true");
  }
  
+ // 標記已顯示過安裝提示
+ localStorage.setItem("watchedit_install_prompt_shown", "true");
  setDeferredPrompt(null);
  setShowInstallPrompt(false);
};
```

#### 用戶關閉提示後標記：

```diff
const handleDismiss = () => {
+ // 標記已顯示過安裝提示
+ localStorage.setItem("watchedit_install_prompt_shown", "true");
  setShowInstallPrompt(false);
};
```

### 2. 設置頁面功能

**檔案**: `frontend/src/app/settings/page.tsx`

添加重置安裝提示狀態的功能：

```javascript
<Button
  variant="outline"
  size="sm"
  onClick={() => {
    localStorage.removeItem("watchedit_install_prompt_shown");
    localStorage.removeItem("watchedit_pwa_installed");
    setMessage({
      type: "success",
      text: "已重置 PWA 安裝提示狀態",
    });
  }}
>
  <RefreshCw className="w-4 h-4 mr-2" />
  重置安裝提示
</Button>
```

### 3. 測試頁面

**檔案**: `frontend/src/app/test-pwa/page.tsx`

創建了專門的測試頁面來驗證 PWA 安裝功能：

- 顯示 PWA 狀態
- 顯示安裝提示狀態
- 提供重置功能
- 提供模擬安裝提示功能

## 🎯 功能特點

### 1. 智能顯示
- ✅ 只在首次使用時顯示
- ✅ 已安裝後不再顯示
- ✅ 用戶關閉後不再顯示

### 2. 狀態管理
- ✅ 本地儲存狀態
- ✅ 跨會話保持
- ✅ 可手動重置

### 3. 用戶體驗
- ✅ 不重複打擾用戶
- ✅ 提供重置選項
- ✅ 清晰的狀態顯示

## 📊 狀態說明

### localStorage 鍵值：

1. **`watchedit_install_prompt_shown`**
   - 用途: 記錄是否已經顯示過安裝提示
   - 值: `"true"` 或 `null`
   - 設置時機: 用戶看到安裝提示時

2. **`watchedit_pwa_installed`**
   - 用途: 記錄是否已經安裝過 PWA
   - 值: `"true"` 或 `null`
   - 設置時機: 用戶成功安裝 PWA 時

### 顯示條件：

```javascript
// 顯示安裝提示的條件
const shouldShowInstallPrompt = 
  hasInstallPrompt &&           // 瀏覽器支援安裝
  !hasShownInstallPrompt &&     // 未顯示過提示
  !hasInstalledPWA;            // 未安裝過 PWA
```

## 🧪 測試方法

### 1. 首次使用測試
1. 清除瀏覽器本地儲存
2. 訪問應用
3. 確認安裝提示出現

### 2. 重複使用測試
1. 關閉安裝提示
2. 重新整理頁面
3. 確認安裝提示不再出現

### 3. 安裝後測試
1. 成功安裝 PWA
2. 重新整理頁面
3. 確認安裝提示不再出現

### 4. 重置功能測試
1. 在設置頁面點擊「重置安裝提示」
2. 重新整理頁面
3. 確認安裝提示重新出現

## 🔧 技術細節

### 事件監聽
- `beforeinstallprompt`: 檢測安裝提示可用性
- `appinstalled`: 檢測 PWA 安裝完成

### 平台檢測
- PWA 模式: `window.matchMedia("(display-mode: standalone)")`
- 移動設備: User Agent 檢測
- iOS/Android: 平台特定檢測

### 狀態同步
- 使用 localStorage 跨會話保持狀態
- 即時更新 UI 狀態
- 提供手動重置功能

## 📱 支援平台

### 桌面瀏覽器
- Chrome: ✅ 完整支援
- Edge: ✅ 完整支援
- Firefox: ✅ 完整支援
- Safari: ⚠️ 部分支援（需要手動安裝）

### 移動瀏覽器
- Chrome (Android): ✅ 完整支援
- Safari (iOS): ⚠️ 需要手動添加到主畫面
- Samsung Internet: ✅ 完整支援

## 🎉 完成狀態

✅ **首次使用顯示邏輯已實現**
✅ **狀態管理已完善**
✅ **設置頁面功能已添加**
✅ **測試頁面已創建**
✅ **建置測試通過**
✅ **功能測試通過**

🎯 **PWA 安裝提示首次使用功能完成！**

---

**實現時間**: 2024年8月  
**功能範圍**: PWA 安裝提示管理  
**影響範圍**: 改善用戶體驗，避免重複提示 