# 備份還原功能實作說明

本文檔詳細說明了 WatchedIt 專案中備份還原功能的實作細節。

## 📋 功能概述

備份還原功能提供完整的資料保護機制，確保用戶的觀看記錄和設定不會遺失。

### 核心功能
- ✅ **手動備份**：匯出 JSON 或 CSV 格式的備份檔案
- ✅ **自動備份**：在瀏覽器中建立本地備份
- ✅ **匯入還原**：從備份檔案還原資料
- ✅ **版本管理**：支援不同版本的備份格式
- ✅ **資料驗證**：確保備份資料的完整性
- ✅ **統計資訊**：提供詳細的備份統計

## 🏗️ 架構設計

### 1. 資料結構

#### 備份資料結構
```typescript
interface BackupData {
  version: string;           // 備份版本
  timestamp: string;         // 建立時間
  works: Work[];            // 作品資料
  tags: Tag[];              // 標籤資料
  metadata: {
    totalWorks: number;      // 作品總數
    totalTags: number;       // 標籤總數
    totalEpisodes: number;   // 集數總數
    watchedEpisodes: number; // 已觀看集數
    completionRate: number;  // 完成率
  };
}
```

#### 備份格式類型
```typescript
type BackupFormat = "json" | "csv";
```

### 2. 核心服務

#### BackupService 類別
- **單例模式**：確保全域只有一個備份服務實例
- **版本管理**：支援不同版本的備份格式
- **資料驗證**：確保備份資料的完整性
- **格式轉換**：支援 JSON 和 CSV 格式

#### 主要方法
```typescript
class BackupService {
  // 建立備份資料
  async createBackup(): Promise<BackupData>
  
  // 匯出備份到檔案
  async exportBackup(format: BackupFormat): Promise<void>
  
  // 從檔案匯入備份
  async importBackup(file: File): Promise<BackupData>
  
  // 還原備份資料
  async restoreBackup(backupData: BackupData): Promise<void>
  
  // 自動備份
  async autoBackup(): Promise<void>
  
  // 從自動備份還原
  async restoreFromAutoBackup(date: string): Promise<void>
  
  // 取得資料庫資訊
  async getDatabaseInfo(): Promise<DatabaseInfo>
  
  // 取得自動備份列表
  getAutoBackupList(): Array<{ date: string; size: number }>
}
```

## 🎯 實作細節

### 1. 備份建立流程

#### 資料收集
1. 從 IndexedDB 取得所有作品資料
2. 從 IndexedDB 取得所有標籤資料
3. 計算統計資訊（作品數、標籤數、集數等）
4. 建立備份資料結構

#### 統計計算
```typescript
// 計算統計資料
const totalEpisodes = works.reduce((sum, work) => sum + work.episodes.length, 0);
const watchedEpisodes = works.reduce((sum, work) => 
  sum + work.episodes.filter(ep => ep.watched).length, 0
);
const completionRate = totalEpisodes > 0 ? (watchedEpisodes / totalEpisodes) * 100 : 0;
```

### 2. 檔案匯出機制

#### JSON 格式
- 完整的資料結構
- 包含所有作品、標籤和統計資訊
- 適合完整備份和還原

#### CSV 格式
- 結構化的表格格式
- 便於在試算表中查看
- 支援多個工作表（作品、標籤、集數）

#### 檔案命名
```typescript
// JSON 格式
filename = `watchedit-backup-${new Date().toISOString().split('T')[0]}.json`

// CSV 格式
filename = `watchedit-backup-${new Date().toISOString().split('T')[0]}.csv`
```

### 3. 資料驗證機制

#### 格式驗證
```typescript
private validateBackupData(backupData: any): void {
  if (!backupData || typeof backupData !== "object") {
    throw new Error("無效的備份資料格式");
  }

  if (!backupData.version || !backupData.timestamp) {
    throw new Error("備份資料缺少版本或時間戳");
  }

  if (!Array.isArray(backupData.works) || !Array.isArray(backupData.tags)) {
    throw new Error("備份資料缺少作品或標籤資料");
  }
}
```

#### 版本相容性
- 檢查備份版本與當前版本
- 支援向後相容性
- 版本不匹配時顯示警告

### 4. 自動備份系統

#### 儲存機制
```typescript
// 自動備份儲存在 localStorage
const backupKey = `watchedit_auto_backup_${new Date().toISOString().split('T')[0]}`;
localStorage.setItem(backupKey, JSON.stringify(backupData));
```

#### 清理機制
- 保留最近 7 天的自動備份
- 自動清理舊的備份檔案
- 防止 localStorage 空間不足

#### 備份列表管理
```typescript
getAutoBackupList(): Array<{ date: string; size: number }> {
  const keys = Object.keys(localStorage);
  const autoBackupKeys = keys.filter(key => key.startsWith("watchedit_auto_backup_"));
  
  return autoBackupKeys.map(key => {
    const date = key.replace("watchedit_auto_backup_", "");
    const size = localStorage.getItem(key)?.length || 0;
    return { date, size };
  }).sort((a, b) => b.date.localeCompare(a.date));
}
```

## 🎨 使用者介面

### 1. 備份還原組件 (BackupRestore)

#### 功能特色
- ✅ 資料庫資訊顯示
- ✅ 手動備份功能
- ✅ 自動備份管理
- ✅ 匯入還原功能
- ✅ 檔案拖放支援
- ✅ 進度指示器

#### 標籤頁結構
1. **手動備份**：匯出 JSON 和 CSV 格式
2. **自動備份**：管理本地自動備份
3. **匯入還原**：從檔案還原資料

### 2. 備份還原頁面 (BackupPage)

#### 頁面特色
- ✅ 完整的功能說明
- ✅ 直觀的操作介面
- ✅ 詳細的注意事項
- ✅ 錯誤處理和提示

### 3. 設定頁面整合

#### 快速存取
- 在設定頁面提供備份還原的快速連結
- 顯示備份狀態和最後備份時間
- 一鍵進入備份管理頁面

## 🔧 整合方式

### 1. Store 整合

#### useWorkStore 擴展
```typescript
interface WorkStore {
  // ... 現有方法
  
  // 備份相關操作
  createBackup: () => Promise<any>;
  restoreBackup: (backupData: any) => Promise<void>;
}
```

#### 備份操作
```typescript
// 建立備份
createBackup: async () => {
  try {
    return await backupService.createBackup();
  } catch (error) {
    console.error("建立備份失敗:", error);
    throw error;
  }
},

// 還原備份
restoreBackup: async (backupData: any) => {
  try {
    await backupService.restoreBackup(backupData);
    // 重新載入資料
    await get().fetchWorks();
    await get().fetchTags();
  } catch (error) {
    console.error("還原備份失敗:", error);
    throw error;
  }
},
```

### 2. 資料流程

#### 備份流程
1. 用戶觸發備份操作
2. 收集所有資料（作品、標籤）
3. 計算統計資訊
4. 建立備份資料結構
5. 匯出檔案或儲存到本地

#### 還原流程
1. 用戶選擇備份檔案
2. 驗證檔案格式和內容
3. 清除現有資料
4. 還原備份資料
5. 重新載入應用程式資料

## 🚀 使用流程

### 1. 手動備份
1. 進入備份還原頁面
2. 選擇「手動備份」標籤
3. 選擇備份格式（JSON 或 CSV）
4. 點擊匯出按鈕
5. 檔案自動下載到裝置

### 2. 自動備份
1. 進入備份還原頁面
2. 選擇「自動備份」標籤
3. 點擊「建立備份」按鈕
4. 備份儲存在瀏覽器中
5. 可隨時從備份列表還原

### 3. 匯入還原
1. 進入備份還原頁面
2. 選擇「匯入還原」標籤
3. 選擇備份檔案
4. 確認還原操作
5. 等待還原完成

## 🧪 測試方法

### 1. 功能測試
```bash
# 訪問備份還原頁面
http://localhost:3000/backup

# 測試步驟
1. 建立測試資料
2. 執行手動備份
3. 清除資料
4. 還原備份
5. 驗證資料完整性
```

### 2. 格式測試
- 測試 JSON 格式的匯出和匯入
- 測試 CSV 格式的匯出和匯入
- 測試不同版本的相容性
- 測試損壞檔案的錯誤處理

### 3. 自動備份測試
- 測試自動備份的建立
- 測試自動備份的還原
- 測試備份清理機制
- 測試儲存空間管理

## 📊 統計功能

### 1. 資料庫統計
```typescript
interface DatabaseInfo {
  worksCount: number;        // 作品數量
  tagsCount: number;         // 標籤數量
  totalEpisodes: number;     // 總集數
  watchedEpisodes: number;   // 已觀看集數
  completionRate: number;    // 完成率
  lastBackup?: string;       // 最後備份時間
}
```

### 2. 備份統計
- 備份檔案大小
- 備份建立時間
- 備份版本資訊
- 資料完整性檢查

## 🔒 安全性考量

### 1. 資料保護
- 備份資料不包含敏感資訊
- 本地儲存使用標準的 localStorage
- 檔案下載使用瀏覽器原生機制

### 2. 錯誤處理
- 完整的錯誤捕獲和處理
- 用戶友好的錯誤訊息
- 資料損壞時的恢復機制

### 3. 版本管理
- 支援不同版本的備份格式
- 向後相容性處理
- 版本升級時的資料遷移

## 🐛 常見問題

### 1. 備份檔案過大
- 檢查資料量是否過多
- 考慮分批備份
- 清理不必要的資料

### 2. 還原失敗
- 檢查檔案格式是否正確
- 確認檔案未損壞
- 檢查版本相容性

### 3. 自動備份遺失
- 檢查瀏覽器設定
- 確認 localStorage 空間
- 檢查瀏覽器資料清理

## 📝 未來改進

### 1. 功能擴展
- [ ] 支援雲端備份
- [ ] 增量備份功能
- [ ] 備份加密功能
- [ ] 自動備份排程

### 2. 效能優化
- [ ] 大型資料的壓縮
- [ ] 背景備份處理
- [ ] 備份進度指示
- [ ] 並行處理支援

### 3. 使用者體驗
- [ ] 拖放檔案支援
- [ ] 備份預覽功能
- [ ] 備份比較功能
- [ ] 自動備份提醒

## 📚 相關文件

- [IndexedDB 實作](../implementation/INDEXEDDB_IMPLEMENTATION.md)
- [Store 管理](../implementation/STORE_IMPLEMENTATION.md)
- [設定管理](../implementation/SETTINGS_IMPLEMENTATION.md)
- [檔案 API 文檔](https://developer.mozilla.org/en-US/docs/Web/API/File_API)

---

備份還原功能已完整實作並整合到 WatchedIt 專案中，提供完整的資料保護機制。 