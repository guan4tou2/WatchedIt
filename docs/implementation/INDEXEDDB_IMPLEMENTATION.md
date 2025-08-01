# IndexedDB 實現說明

## 概述

WatchedIt 應用程式已經完全使用 IndexedDB 進行主要資料儲存，確保資料的持久性和可靠性。

## 實現架構

### 1. IndexedDB 管理器

**檔案**: `frontend/src/lib/indexedDB.ts`

```typescript
// IndexedDB 配置
const DB_NAME = "WatchedItDB";
const DB_VERSION = 1;
const STORES = {
  WORKS: "works",
  TAGS: "tags",
} as const;

// IndexedDB 管理器類別
class IndexedDBManager {
  private db: IDBDatabase | null = null;
  
  // 初始化資料庫
  async init(): Promise<void>
  
  // 通用 CRUD 操作
  async getAll<T>(storeName: string): Promise<T[]>
  async get<T>(storeName: string, id: string | number): Promise<T | null>
  async add<T>(storeName: string, item: T): Promise<void>
  async put<T>(storeName: string, item: T): Promise<void>
  async delete(storeName: string, id: string | number): Promise<void>
  async clear(storeName: string): Promise<void>
}
```

### 2. 作品儲存

**檔案**: `frontend/src/lib/indexedDB.ts`

```typescript
export const workStorage = {
  // 基本操作
  async init(): Promise<void>
  async getAll(): Promise<Work[]>
  async setAll(works: Work[]): Promise<void>
  async create(workData: WorkCreate): Promise<Work>
  async update(id: string, workData: WorkUpdate): Promise<Work | null>
  async delete(id: string): Promise<boolean>
  
  // 查詢操作
  async findByTitle(title: string): Promise<Work | null>
  async findByAniListId(aniListId: number): Promise<Work | null>
  async getList(params?: {...}): Promise<WorkList>
  
  // 統計操作
  async getStats(): Promise<Stats>
}
```

### 3. 標籤儲存

**檔案**: `frontend/src/lib/indexedDB.ts`

```typescript
export const tagStorage = {
  // 基本操作
  async init(): Promise<void>
  async getAll(): Promise<Tag[]>
  async setAll(tags: Tag[]): Promise<void>
  async create(tagData: { name: string; color: string }): Promise<Tag>
  async update(id: number, tagData: {...}): Promise<Tag | null>
  async delete(id: number): Promise<boolean>
}
```

## 資料庫結構

### 作品儲存 (works)
- **主鍵**: `id` (string)
- **索引**:
  - `title` (string)
  - `type` (string)
  - `status` (string)
  - `year` (number)

### 標籤儲存 (tags)
- **主鍵**: `id` (number)
- **索引**:
  - `name` (string)

## 狀態管理整合

**檔案**: `frontend/src/store/useWorkStore.ts`

```typescript
export const useWorkStore = create<WorkStore>((set, get) => ({
  // 初始化
  initialize: async () => {
    await workStorage.init();
    await tagStorage.init();
    
    const works = await workStorage.getAll();
    const tags = await tagStorage.getAll();
    const stats = await workStorage.getStats();
    
    set({ works, tags, stats });
  },
  
  // 作品操作
  createWork: async (workData) => {
    const newWork = await workStorage.create(workData);
    const works = await workStorage.getAll();
    const stats = await workStorage.getStats();
    set({ works, stats });
    return newWork;
  },
  
  // 標籤操作
  createTag: async (tagData) => {
    const newTag = await tagStorage.create(tagData);
    const tags = await tagStorage.getAll();
    set({ tags });
    return newTag;
  },
}));
```

## 資料遷移

### 從 localStorage 遷移到 IndexedDB

**檔案**: `frontend/src/lib/migration.ts`

```typescript
// 檢查是否需要遷移
export async function checkMigrationNeeded(): Promise<{
  needsMigration: boolean;
  hasLocalData: boolean;
  hasIndexedDBData: boolean;
}>

// 執行遷移
export async function migrateFromLocalStorage(): Promise<{
  success: boolean;
  message: string;
  migratedWorks: number;
  migratedTags: number;
}>

// 清理 localStorage
export function clearLocalStorageData(): void
```

## 測試和驗證

### 測試頁面
- **URL**: `/test-indexeddb`
- **功能**:
  - 查看資料庫信息
  - 新增測試作品和標籤
  - 匯出數據
  - 清空所有數據

### 測試方法
1. 訪問 `/test-indexeddb` 頁面
2. 點擊「新增作品」或「新增標籤」
3. 檢查資料是否正確儲存
4. 重新整理頁面，確認資料持久化
5. 使用「匯出數據」功能備份

## 優勢

### 相比 localStorage
1. **更大的儲存空間**: IndexedDB 支援更大的資料量
2. **更好的性能**: 支援索引查詢，查詢速度更快
3. **結構化資料**: 支援複雜的資料結構
4. **非阻塞操作**: 不會阻塞主執行緒
5. **版本控制**: 支援資料庫版本升級

### 相比其他儲存方案
1. **本地儲存**: 資料不會上傳到伺服器
2. **離線支援**: 完全離線運作
3. **跨標籤頁同步**: 多個標籤頁可以共享資料
4. **自動備份**: 瀏覽器會自動備份 IndexedDB 資料

## 使用場景

### 主要資料儲存
- ✅ 作品資料
- ✅ 標籤資料
- ✅ 集數資料
- ✅ 統計資料

### 仍使用 localStorage 的資料
- ✅ 應用程式設定
- ✅ 主題設定
- ✅ UI 狀態（如「不再提醒」）
- ✅ 雲端同步配置

## 錯誤處理

### 常見錯誤
1. **IndexedDB 不可用**
   - 檢查瀏覽器支援
   - 檢查隱私模式設定
   - 檢查儲存空間

2. **資料庫版本衝突**
   - 自動處理版本升級
   - 清理舊版本資料

3. **資料損壞**
   - 提供資料匯出功能
   - 支援資料重置

### 錯誤處理策略
```typescript
try {
  const works = await workStorage.getAll();
  return works;
} catch (error) {
  console.error("讀取作品數據失敗:", error);
  return []; // 返回空陣列作為預設值
}
```

## 最佳實踐

### 1. 初始化
```typescript
// 在應用程式啟動時初始化
useEffect(() => {
  initialize();
}, []);
```

### 2. 錯誤處理
```typescript
// 總是提供預設值
const works = await workStorage.getAll() || [];
```

### 3. 資料備份
```typescript
// 定期匯出資料
const data = await dbUtils.exportData();
```

### 4. 版本管理
```typescript
// 在資料庫升級時處理舊資料
request.onupgradeneeded = (event) => {
  // 處理版本升級邏輯
};
```

## 注意事項

1. **瀏覽器支援**: 確保目標瀏覽器支援 IndexedDB
2. **儲存限制**: 注意瀏覽器的儲存空間限制
3. **資料備份**: 建議定期匯出重要資料
4. **錯誤處理**: 提供適當的錯誤處理和回退機制
5. **性能優化**: 避免過於頻繁的資料庫操作

## 未來改進

1. **資料壓縮**: 實現資料壓縮以節省空間
2. **增量同步**: 支援增量資料同步
3. **資料加密**: 可選的資料加密功能
4. **自動備份**: 自動定期備份功能
5. **資料分析**: 更詳細的資料使用統計 