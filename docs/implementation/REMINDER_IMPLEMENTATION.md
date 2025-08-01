# 提醒功能實作說明

本文檔詳細說明了 WatchedIt 專案中提醒功能的實作細節。

## 📋 功能概述

提醒功能允許用戶為特定作品設定自動提醒，當作品有未觀看集數時，系統會發送瀏覽器通知提醒用戶。

### 核心功能
- ✅ 為作品設定提醒開關
- ✅ 支援多種提醒頻率（每日、每週、每月、自訂）
- ✅ 自動檢查並發送提醒通知
- ✅ 提醒歷史記錄管理
- ✅ 測試提醒功能
- ✅ 提醒統計和分析

## 🏗️ 架構設計

### 1. 資料結構

#### 作品模型 (Work)
```typescript
interface Work {
  // ... 其他欄位
  reminder_enabled: boolean;           // 是否啟用提醒
  reminder_frequency?: ReminderFrequency; // 提醒頻率
}
```

#### 提醒頻率類型
```typescript
type ReminderFrequency = "daily" | "weekly" | "monthly" | "custom";
```

### 2. 核心服務

#### ReminderService 類別
- **單例模式**：確保全域只有一個提醒服務實例
- **自動初始化**：在應用啟動時自動初始化
- **定期檢查**：每小時自動檢查需要發送的提醒
- **權限管理**：自動請求和管理通知權限

#### 主要方法
```typescript
class ReminderService {
  // 初始化提醒服務
  async initialize(): Promise<void>
  
  // 計算下次提醒日期
  calculateNextReminderDate(frequency: ReminderFrequency, customDays?: number): Date
  
  // 檢查是否需要發送提醒
  shouldSendReminder(work: Work): boolean
  
  // 發送提醒通知
  async sendReminderNotification(work: Work): Promise<void>
  
  // 檢查所有作品的提醒
  async checkAllReminders(works: Work[]): Promise<void>
  
  // 取得提醒統計
  getReminderStats(works: Work[]): ReminderStats
  
  // 測試提醒功能
  async testReminder(workTitle?: string): Promise<void>
}
```

## 🎯 實作細節

### 1. 提醒邏輯

#### 觸發條件
1. **作品狀態**：只有「進行中」的作品才會發送提醒
2. **提醒開關**：必須啟用提醒功能
3. **未觀看集數**：必須有未觀看的集數
4. **時間間隔**：根據設定的頻率檢查上次提醒時間

#### 頻率計算
```typescript
// 根據頻率計算下次提醒日期
switch (frequency) {
  case "daily":
    nextDate.setDate(now.getDate() + 1);
    break;
  case "weekly":
    nextDate.setDate(now.getDate() + 7);
    break;
  case "monthly":
    nextDate.setMonth(now.getMonth() + 1);
    break;
  case "custom":
    nextDate.setDate(now.getDate() + customDays);
    break;
}
```

### 2. 通知系統

#### 通知內容
- **標題**：`📺 提醒：{作品名稱}`
- **內容**：顯示未觀看集數和觀看進度
- **圖標**：使用應用程式圖標
- **標籤**：防止重複通知

#### 通知範例
```
📺 提醒：進擊的巨人
您有 3 集未觀看，已觀看 9/12 集
```

### 3. 資料持久化

#### localStorage 鍵名
- `reminder_last_{workId}`：記錄每個作品的上次提醒時間

#### 資料格式
```typescript
// 上次提醒時間
localStorage.setItem(`reminder_last_${workId}`, new Date().toISOString());
```

## 🎨 使用者介面

### 1. 提醒設定組件 (ReminderSettings)

#### 功能特色
- ✅ 提醒開關控制
- ✅ 頻率選擇器（每日、每週、每月、自訂）
- ✅ 自訂天數輸入
- ✅ 下次提醒時間預覽
- ✅ 提醒狀態顯示
- ✅ 測試和清除功能

#### 使用方式
```tsx
<ReminderSettings 
  work={work} 
  onUpdate={handleWorkUpdate} 
/>
```

### 2. 提醒管理頁面 (RemindersPage)

#### 頁面結構
- **統計卡片**：總作品數、啟用提醒、活躍提醒、需要提醒
- **標籤頁**：概覽、活躍提醒、設定
- **操作按鈕**：檢查提醒、測試提醒

#### 功能特色
- ✅ 提醒統計概覽
- ✅ 需要提醒的作品列表
- ✅ 系統狀態檢查
- ✅ 批量操作功能

### 3. 測試頁面 (TestReminderPage)

#### 測試功能
- ✅ 通知權限測試
- ✅ 提醒通知測試
- ✅ 批量檢查測試
- ✅ 系統狀態檢查

## 🔧 整合方式

### 1. Store 整合

#### useWorkStore 擴展
```typescript
interface WorkStore {
  // ... 現有方法
  
  // 提醒相關操作
  checkReminders: () => Promise<void>;
  testReminder: (workTitle?: string) => Promise<void>;
}
```

#### 初始化整合
```typescript
// 在 store 初始化時啟動提醒服務
initialize: async () => {
  // ... 現有初始化邏輯
  
  // 初始化提醒服務
  await reminderService.initialize();
}
```

### 2. 自動檢查機制

#### 定期檢查
```typescript
// 每小時檢查一次提醒
setInterval(() => {
  this.checkRemindersFromStorage();
}, 60 * 60 * 1000); // 1小時
```

#### 頁面載入檢查
```typescript
// 頁面載入時也檢查一次
this.checkRemindersFromStorage();
```

## 🚀 使用流程

### 1. 設定提醒
1. 進入作品詳情頁面
2. 找到提醒設定區塊
3. 開啟提醒開關
4. 選擇提醒頻率
5. 儲存設定

### 2. 接收提醒
1. 系統自動檢查需要提醒的作品
2. 發送瀏覽器通知
3. 用戶點擊通知查看作品
4. 更新觀看進度

### 3. 管理提醒
1. 進入提醒管理頁面
2. 查看提醒統計
3. 測試提醒功能
4. 清除提醒記錄

## 🧪 測試方法

### 1. 功能測試
```bash
# 訪問測試頁面
http://localhost:3000/test-reminder

# 測試步驟
1. 點擊「測試通知權限」
2. 點擊「測試提醒通知」
3. 點擊「檢查所有提醒」
4. 檢查測試結果
```

### 2. 手動測試
1. 為作品設定提醒
2. 等待或手動觸發檢查
3. 確認通知發送
4. 檢查提醒記錄

## 📊 統計功能

### 1. 提醒統計
```typescript
interface ReminderStats {
  totalEnabled: number;    // 啟用提醒的作品數
  activeReminders: number; // 活躍提醒數
  overdueReminders: number; // 需要提醒數
}
```

### 2. 統計計算
- **啟用提醒**：`works.filter(work => work.reminder_enabled).length`
- **活躍提醒**：`works.filter(work => work.reminder_enabled && work.status === "進行中").length`
- **需要提醒**：`works.filter(work => shouldSendReminder(work)).length`

## 🔒 權限管理

### 1. 通知權限
- 自動請求通知權限
- 檢查權限狀態
- 處理權限被拒絕的情況

### 2. 瀏覽器支援
- 檢查 `Notification` API 支援
- 檢查 Service Worker 支援
- 檢查 PWA 模式

## 🐛 常見問題

### 1. 通知不顯示
- 檢查瀏覽器通知權限
- 確認瀏覽器支援通知功能
- 檢查是否為 HTTPS 環境

### 2. 提醒不觸發
- 檢查作品狀態是否為「進行中」
- 確認有未觀看的集數
- 檢查提醒頻率設定

### 3. 重複通知
- 使用通知標籤防止重複
- 檢查提醒記錄時間
- 確認頻率設定正確

## 📝 未來改進

### 1. 功能擴展
- [ ] 支援更精細的時間設定
- [ ] 添加提醒音效
- [ ] 支援多種通知類型
- [ ] 添加提醒模板

### 2. 效能優化
- [ ] 優化檢查頻率
- [ ] 添加提醒快取
- [ ] 改善通知效能
- [ ] 減少不必要的檢查

### 3. 使用者體驗
- [ ] 添加提醒預覽
- [ ] 支援批量設定
- [ ] 添加提醒歷史
- [ ] 改善通知樣式

## 📚 相關文件

- [PWA 實作](../implementation/PWA_IMPLEMENTATION.md)
- [IndexedDB 實作](../implementation/INDEXEDDB_IMPLEMENTATION.md)
- [Store 管理](../implementation/STORE_IMPLEMENTATION.md)
- [通知 API 文檔](https://developer.mozilla.org/en-US/docs/Web/API/Notifications_API)

---

提醒功能已完整實作並整合到 WatchedIt 專案中，提供完整的提醒管理體驗。 