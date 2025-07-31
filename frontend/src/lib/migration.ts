import { workStorage, tagStorage } from "./indexedDB";

// 從 localStorage 讀取數據
function getLocalStorageData() {
  try {
    const worksData = localStorage.getItem("watchedit_works");
    const tagsData = localStorage.getItem("watchedit_tags");

    const works = worksData ? JSON.parse(worksData) : [];
    const tags = tagsData ? JSON.parse(tagsData) : [];

    return { works, tags };
  } catch (error) {
    console.error("讀取 localStorage 數據失敗:", error);
    return { works: [], tags: [] };
  }
}

// 檢查是否有 localStorage 數據
export function hasLocalStorageData(): boolean {
  try {
    const worksData = localStorage.getItem("watchedit_works");
    const tagsData = localStorage.getItem("watchedit_tags");

    return !!(worksData || tagsData);
  } catch (error) {
    return false;
  }
}

// 遷移數據從 localStorage 到 IndexedDB
export async function migrateFromLocalStorage(): Promise<{
  success: boolean;
  message: string;
  migratedWorks: number;
  migratedTags: number;
}> {
  try {
    // 初始化 IndexedDB
    await workStorage.init();
    await tagStorage.init();

    // 檢查 IndexedDB 是否已有數據
    const existingWorks = await workStorage.getAll();
    const existingTags = await tagStorage.getAll();

    if (existingWorks.length > 0 || existingTags.length > 0) {
      return {
        success: false,
        message: "IndexedDB 已有數據，無法遷移",
        migratedWorks: 0,
        migratedTags: 0,
      };
    }

    // 讀取 localStorage 數據
    const { works, tags } = getLocalStorageData();

    if (works.length === 0 && tags.length === 0) {
      return {
        success: false,
        message: "沒有找到需要遷移的數據",
        migratedWorks: 0,
        migratedTags: 0,
      };
    }

    // 遷移作品數據
    let migratedWorks = 0;
    for (const work of works) {
      try {
        await workStorage.create(work);
        migratedWorks++;
      } catch (error) {
        console.error(`遷移作品失敗: ${work.title}`, error);
      }
    }

    // 遷移標籤數據
    let migratedTags = 0;
    for (const tag of tags) {
      try {
        await tagStorage.create(tag);
        migratedTags++;
      } catch (error) {
        console.error(`遷移標籤失敗: ${tag.name}`, error);
      }
    }

    return {
      success: true,
      message: `遷移完成！成功遷移 ${migratedWorks} 個作品和 ${migratedTags} 個標籤`,
      migratedWorks,
      migratedTags,
    };
  } catch (error) {
    console.error("遷移失敗:", error);
    return {
      success: false,
      message: `遷移失敗: ${
        error instanceof Error ? error.message : "未知錯誤"
      }`,
      migratedWorks: 0,
      migratedTags: 0,
    };
  }
}

// 清理 localStorage 數據（遷移後）
export function clearLocalStorageData(): void {
  try {
    localStorage.removeItem("watchedit_works");
    localStorage.removeItem("watchedit_tags");
    console.log("localStorage 數據已清理");
  } catch (error) {
    console.error("清理 localStorage 失敗:", error);
  }
}

// 檢查是否需要遷移
export async function checkMigrationNeeded(): Promise<{
  needsMigration: boolean;
  hasLocalData: boolean;
  hasIndexedDBData: boolean;
}> {
  try {
    const hasLocalData = hasLocalStorageData();

    // 初始化 IndexedDB 並檢查數據
    await workStorage.init();
    const works = await workStorage.getAll();
    const tags = await tagStorage.getAll();

    const hasIndexedDBData = works.length > 0 || tags.length > 0;
    const needsMigration = hasLocalData && !hasIndexedDBData;

    return {
      needsMigration,
      hasLocalData,
      hasIndexedDBData,
    };
  } catch (error) {
    console.error("檢查遷移狀態失敗:", error);
    return {
      needsMigration: false,
      hasLocalData: false,
      hasIndexedDBData: false,
    };
  }
}
