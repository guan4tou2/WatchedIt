# IndexedDB 遷移說明

## 🚀 從 localStorage 升級到 IndexedDB

### 改進內容

#### 1. **更強大的儲存能力**
- **localStorage**: 限制約 5-10MB
- **IndexedDB**: 可儲存數百 MB 數據，支援複雜查詢

#### 2. **更好的性能**
- **索引查詢**: 支援按標題、類型、狀態等快速查詢
- **異步操作**: 不會阻塞主線程
- **批量操作**: 支援大量數據的高效處理

#### 3. **更完整的數據結構**
- **複雜對象**: 支援嵌套的數據結構
- **索引**: 自動建立查詢索引
- **事務**: 確保數據一致性

### 新功能

#### 1. **數據庫管理工具**
```typescript
import { dbUtils } from "@/lib/indexedDB";

// 匯出所有數據
const data = await dbUtils.exportData();

// 匯入數據
await dbUtils.importData(data);

// 清空所有數據
await dbUtils.clearAll();

// 取得資料庫信息
const info = await dbUtils.getDatabaseInfo();
```

#### 2. **自動遷移功能**
- 檢測舊版 localStorage 數據
- 自動遷移到 IndexedDB
- 遷移完成後清理舊數據

#### 3. **測試頁面**
- 訪問 `/test-indexeddb` 進行功能測試
- 測試新增、查詢、匯出等功能

### 使用方式

#### 1. **自動遷移**
首次訪問應用時，如果檢測到 localStorage 數據，會顯示遷移提示：

```jsx
{migrationStatus?.needsMigration && (
  <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-6">
    <AlertTriangle className="w-5 h-5 mr-2" />
    發現舊版數據，建議進行數據遷移。
    <Button onClick={handleMigration}>
      立即遷移
    </Button>
  </div>
)}
```

#### 2. **手動測試**
訪問測試頁面：`http://localhost:3000/test-indexeddb`

### API 變更

#### 1. **異步操作**
所有數據操作都改為異步：

```typescript
// 舊版 (localStorage)
const works = workStorage.getAll();
workStorage.create(workData);

// 新版 (IndexedDB)
const works = await workStorage.getAll();
await workStorage.create(workData);
```

#### 2. **初始化**
需要先初始化資料庫：

```typescript
// 初始化
await workStorage.init();
await tagStorage.init();
```

#### 3. **錯誤處理**
所有操作都包含完整的錯誤處理：

```typescript
try {
  const works = await workStorage.getAll();
} catch (error) {
  console.error("讀取數據失敗:", error);
}
```

### 技術細節

#### 1. **資料庫結構**
```typescript
const DB_NAME = "WatchedItDB";
const DB_VERSION = 1;
const STORES = {
  WORKS: "works",
  TAGS: "tags",
};
```

#### 2. **索引設計**
```typescript
// 作品儲存索引
worksStore.createIndex("title", "title", { unique: false });
worksStore.createIndex("type", "type", { unique: false });
worksStore.createIndex("status", "status", { unique: false });
worksStore.createIndex("year", "year", { unique: false });

// 標籤儲存索引
tagsStore.createIndex("name", "name", { unique: false });
```

#### 3. **事務處理**
```typescript
const transaction = db.transaction([storeName], "readwrite");
const store = transaction.objectStore(storeName);
const request = store.put(item);
```

### 相容性

#### 1. **瀏覽器支援**
- Chrome 23+
- Firefox 16+
- Safari 10+
- Edge 12+

#### 2. **降級處理**
如果 IndexedDB 不可用，會自動降級到 localStorage：

```typescript
if (!window.indexedDB) {
  console.warn("IndexedDB 不可用，降級到 localStorage");
  // 使用 localStorage 實現
}
```

### 性能提升

#### 1. **查詢性能**
- **localStorage**: O(n) 線性查詢
- **IndexedDB**: O(log n) 索引查詢

#### 2. **儲存容量**
- **localStorage**: ~5-10MB
- **IndexedDB**: 數百 MB 到數 GB

#### 3. **並發處理**
- **localStorage**: 同步阻塞
- **IndexedDB**: 異步非阻塞

### 測試驗證

#### 1. **功能測試**
```bash
# 訪問測試頁面
http://localhost:3000/test-indexeddb
```

#### 2. **性能測試**
```javascript
// 測試大量數據
const start = Date.now();
for (let i = 0; i < 1000; i++) {
  await workStorage.create({
    title: `測試作品 ${i}`,
    type: "動畫",
    status: "進行中",
  });
}
const end = Date.now();
console.log(`新增 1000 個作品耗時: ${end - start}ms`);
```

### 遷移流程

#### 1. **自動檢測**
- 檢查 localStorage 是否有數據
- 檢查 IndexedDB 是否為空

#### 2. **數據遷移**
- 讀取 localStorage 數據
- 寫入 IndexedDB
- 驗證數據完整性

#### 3. **清理舊數據**
- 遷移成功後清理 localStorage
- 更新應用狀態

### 注意事項

#### 1. **數據備份**
遷移前建議先匯出數據：
```javascript
// 匯出 localStorage 數據
const data = {
  works: JSON.parse(localStorage.getItem("watchedit_works") || "[]"),
  tags: JSON.parse(localStorage.getItem("watchedit_tags") || "[]"),
};
```

#### 2. **錯誤處理**
所有異步操作都包含錯誤處理：
```typescript
try {
  await workStorage.create(workData);
} catch (error) {
  console.error("新增作品失敗:", error);
  // 顯示用戶友好的錯誤信息
}
```

#### 3. **版本管理**
資料庫版本管理：
```typescript
const DB_VERSION = 1; // 版本號，用於升級
```

### 總結

IndexedDB 的升級為 WatchedIt 帶來了：

1. **更大的儲存容量** - 支援更多作品和複雜數據
2. **更好的性能** - 索引查詢和異步操作
3. **更強的可靠性** - 事務處理和錯誤恢復
4. **更好的擴展性** - 支援複雜查詢和批量操作

這個升級是向後相容的，現有用戶的數據會被自動遷移，不會影響使用體驗。 