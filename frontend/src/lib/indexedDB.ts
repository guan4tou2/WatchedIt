import {
  Work,
  WorkCreate,
  WorkUpdate,
  WorkList,
  Tag,
  Stats,
  Episode,
} from "@/types";

// IndexedDB 配置
const DB_NAME = "WatchedItDB";
const DB_VERSION = 1;
const STORES = {
  WORKS: "works",
  TAGS: "tags",
} as const;

// 生成 UUID
function generateId(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// 取得當前時間戳
function getCurrentTimestamp(): string {
  return new Date().toISOString();
}

// IndexedDB 管理器
class IndexedDBManager {
  private db: IDBDatabase | null = null;

  // 初始化資料庫
  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        console.error("IndexedDB 初始化失敗:", request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // 創建作品儲存
        if (!db.objectStoreNames.contains(STORES.WORKS)) {
          const worksStore = db.createObjectStore(STORES.WORKS, {
            keyPath: "id",
          });
          worksStore.createIndex("title", "title", { unique: false });
          worksStore.createIndex("type", "type", { unique: false });
          worksStore.createIndex("status", "status", { unique: false });
          worksStore.createIndex("year", "year", { unique: false });
        }

        // 創建標籤儲存
        if (!db.objectStoreNames.contains(STORES.TAGS)) {
          const tagsStore = db.createObjectStore(STORES.TAGS, {
            keyPath: "id",
          });
          tagsStore.createIndex("name", "name", { unique: false });
        }
      };
    });
  }

  // 確保資料庫已初始化
  private async ensureDB(): Promise<IDBDatabase> {
    if (!this.db) {
      await this.init();
    }
    return this.db!;
  }

  // 通用 CRUD 操作
  async getAll<T>(storeName: string): Promise<T[]> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], "readonly");
      const store = transaction.objectStore(storeName);
      const request = store.getAll();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  async get<T>(storeName: string, id: string | number): Promise<T | null> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], "readonly");
      const store = transaction.objectStore(storeName);
      const request = store.get(id);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result || null);
    });
  }

  async add<T>(storeName: string, item: T): Promise<void> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], "readwrite");
      const store = transaction.objectStore(storeName);
      const request = store.add(item);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async put<T>(storeName: string, item: T): Promise<void> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], "readwrite");
      const store = transaction.objectStore(storeName);
      const request = store.put(item);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async delete(storeName: string, id: string | number): Promise<void> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], "readwrite");
      const store = transaction.objectStore(storeName);
      const request = store.delete(id);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async clear(storeName: string): Promise<void> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], "readwrite");
      const store = transaction.objectStore(storeName);
      const request = store.clear();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  // 使用索引查詢
  async getByIndex<T>(
    storeName: string,
    indexName: string,
    value: any
  ): Promise<T[]> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], "readonly");
      const store = transaction.objectStore(storeName);
      const index = store.index(indexName);
      const request = index.getAll(value);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }
}

// 創建全局 IndexedDB 管理器實例
const dbManager = new IndexedDBManager();

// 作品相關操作
export const workStorage = {
  // 初始化
  async init(): Promise<void> {
    await dbManager.init();
  },

  // 取得所有作品
  async getAll(): Promise<Work[]> {
    try {
      return await dbManager.getAll<Work>(STORES.WORKS);
    } catch (error) {
      console.error("讀取作品數據失敗:", error);
      return [];
    }
  },

  // 設定所有作品（用於批量操作）
  async setAll(works: Work[]): Promise<void> {
    try {
      await dbManager.clear(STORES.WORKS);
      for (const work of works) {
        await dbManager.put(STORES.WORKS, work);
      }
    } catch (error) {
      console.error("儲存作品數據失敗:", error);
    }
  },

  // 根據標題查找作品
  async findByTitle(title: string): Promise<Work | null> {
    try {
      const works = await dbManager.getByIndex<Work>(
        STORES.WORKS,
        "title",
        title
      );
      return works.find((work) => work.title === title) || null;
    } catch (error) {
      console.error("查找作品失敗:", error);
      return null;
    }
  },

  // 檢查 AniList 作品是否已存在
  async findByAniListId(aniListId: number): Promise<Work | null> {
    try {
      const works = await this.getAll();
      return (
        works.find(
          (work) => work.note && work.note.includes(`AniList ID: ${aniListId}`)
        ) || null
      );
    } catch (error) {
      console.error("查找 AniList 作品失敗:", error);
      return null;
    }
  },

  // 新增作品
  async create(workData: WorkCreate): Promise<Work> {
    const newWork: Work = {
      id: generateId(),
      ...workData,
      reminder_enabled: workData.reminder_enabled ?? false,
      date_added: getCurrentTimestamp(),
      date_updated: undefined,
      tags: [],
      episodes: workData.episodes || [],
    };

    try {
      await dbManager.add(STORES.WORKS, newWork);
      return newWork;
    } catch (error) {
      console.error("新增作品失敗:", error);
      throw error;
    }
  },

  // 更新作品
  async update(id: string, workData: WorkUpdate): Promise<Work | null> {
    try {
      const existingWork = await dbManager.get<Work>(STORES.WORKS, id);
      if (!existingWork) return null;

      const updatedWork: Work = {
        ...existingWork,
        ...workData,
        date_updated: getCurrentTimestamp(),
      };

      await dbManager.put(STORES.WORKS, updatedWork);
      return updatedWork;
    } catch (error) {
      console.error("更新作品失敗:", error);
      return null;
    }
  },

  // 刪除作品
  async delete(id: string): Promise<boolean> {
    try {
      await dbManager.delete(STORES.WORKS, id);
      return true;
    } catch (error) {
      console.error("刪除作品失敗:", error);
      return false;
    }
  },

  // 清空所有作品
  async clearAll(): Promise<void> {
    try {
      await dbManager.clear(STORES.WORKS);
    } catch (error) {
      console.error("清空作品數據失敗:", error);
    }
  },

  // 取得作品列表（支援分頁和篩選）
  async getList(params?: {
    page?: number;
    size?: number;
    title?: string;
    type?: string;
    status?: string;
    year?: number;
    tag_ids?: number[];
  }): Promise<WorkList> {
    try {
      let works = await this.getAll();

      // 篩選
      if (params?.title) {
        works = works.filter((w) =>
          w.title.toLowerCase().includes(params.title!.toLowerCase())
        );
      }

      if (params?.type) {
        works = works.filter((w) => w.type === params.type);
      }

      if (params?.status) {
        works = works.filter((w) => w.status === params.status);
      }

      if (params?.year) {
        works = works.filter((w) => w.year === params.year);
      }

      if (params?.tag_ids && params.tag_ids.length > 0) {
        works = works.filter((w) =>
          w.tags.some((tag) => params.tag_ids!.includes(tag.id))
        );
      }

      // 分頁
      const page = params?.page || 1;
      const size = params?.size || 20;
      const start = (page - 1) * size;
      const end = start + size;

      return {
        works: works.slice(start, end),
        total: works.length,
        page,
        size,
      };
    } catch (error) {
      console.error("取得作品列表失敗:", error);
      return {
        works: [],
        total: 0,
        page: 1,
        size: 20,
      };
    }
  },

  // 取得統計數據
  async getStats(): Promise<Stats> {
    try {
      const works = await this.getAll();

      // 按類型統計
      const typeStats: Record<string, number> = {};
      works.forEach((work) => {
        typeStats[work.type] = (typeStats[work.type] || 0) + 1;
      });

      // 按狀態統計
      const statusStats: Record<string, number> = {};
      works.forEach((work) => {
        statusStats[work.status] = (statusStats[work.status] || 0) + 1;
      });

      // 按年份統計
      const yearStats: Record<string, number> = {};
      works.forEach((work) => {
        const year = work.year?.toString() || "未知";
        yearStats[year] = (yearStats[year] || 0) + 1;
      });

      // 集數統計
      let totalEpisodes = 0;
      let watchedEpisodes = 0;

      works.forEach((work) => {
        if (work.episodes) {
          totalEpisodes += work.episodes.length;
          watchedEpisodes += work.episodes.filter((ep) => ep.watched).length;
        }
      });

      const completionRate =
        totalEpisodes > 0
          ? Math.round((watchedEpisodes / totalEpisodes) * 100)
          : 0;

      return {
        total_works: works.length,
        type_stats: typeStats,
        status_stats: statusStats,
        year_stats: yearStats,
        episode_stats: {
          total_episodes: totalEpisodes,
          watched_episodes: watchedEpisodes,
          completion_rate: completionRate,
        },
      };
    } catch (error) {
      console.error("取得統計數據失敗:", error);
      return {
        total_works: 0,
        type_stats: {},
        status_stats: {},
        year_stats: {},
        episode_stats: {
          total_episodes: 0,
          watched_episodes: 0,
          completion_rate: 0,
        },
      };
    }
  },
};

// 標籤相關操作
export const tagStorage = {
  // 初始化
  async init(): Promise<void> {
    await dbManager.init();
  },

  // 取得所有標籤
  async getAll(): Promise<Tag[]> {
    try {
      return await dbManager.getAll<Tag>(STORES.TAGS);
    } catch (error) {
      console.error("讀取標籤數據失敗:", error);
      return [];
    }
  },

  // 設定所有標籤（用於批量操作）
  async setAll(tags: Tag[]): Promise<void> {
    try {
      await dbManager.clear(STORES.TAGS);
      for (const tag of tags) {
        await dbManager.put(STORES.TAGS, tag);
      }
    } catch (error) {
      console.error("儲存標籤數據失敗:", error);
    }
  },

  // 新增標籤
  async create(tagData: { name: string; color: string }): Promise<Tag> {
    try {
      const tags = await this.getAll();
      const newTag: Tag = {
        id: Math.max(0, ...tags.map((t) => t.id)) + 1,
        ...tagData,
      };

      await dbManager.add(STORES.TAGS, newTag);
      return newTag;
    } catch (error) {
      console.error("新增標籤失敗:", error);
      throw error;
    }
  },

  // 更新標籤
  async update(
    id: number,
    tagData: { name?: string; color?: string }
  ): Promise<Tag | null> {
    try {
      const existingTag = await dbManager.get<Tag>(STORES.TAGS, id);
      if (!existingTag) return null;

      const updatedTag: Tag = { ...existingTag, ...tagData };
      await dbManager.put(STORES.TAGS, updatedTag);
      return updatedTag;
    } catch (error) {
      console.error("更新標籤失敗:", error);
      return null;
    }
  },

  // 刪除標籤
  async delete(id: number): Promise<boolean> {
    try {
      await dbManager.delete(STORES.TAGS, id);
      return true;
    } catch (error) {
      console.error("刪除標籤失敗:", error);
      return false;
    }
  },

  // 清空所有標籤
  async clearAll(): Promise<void> {
    try {
      await dbManager.clear(STORES.TAGS);
    } catch (error) {
      console.error("清空標籤數據失敗:", error);
    }
  },
};

// 初始化示例數據
export const initializeSampleData = async () => {
  try {
    await dbManager.init();

    const works = await workStorage.getAll();
    const tags = await tagStorage.getAll();

    if (works.length === 0) {
      // 動畫類型 - 進擊的巨人
      await workStorage.create({
        title: "進擊的巨人",
        type: "動畫",
        status: "已完結",
        year: 2013,
        rating: 5,
        review: "經典神作！劇情緊湊，角色塑造深刻，音樂震撼人心。",
        source: "AniList",
        episodes: [
          {
            id: "ep-1",
            number: 1,
            title: "致2000年後的你",
            description: "艾連·葉卡在夢中看到未來",
            type: "episode",
            season: 1,
            watched: true,
            date_watched: "2023-01-15T00:00:00.000Z",
          },
          {
            id: "ep-2",
            number: 2,
            title: "那一天",
            description: "巨人入侵希干希納區",
            type: "episode",
            season: 1,
            watched: true,
            date_watched: "2023-01-15T00:00:00.000Z",
          },
          {
            id: "ep-special",
            number: 1,
            title: "無悔的選擇",
            description: "里維兵長的外傳",
            type: "special",
            season: 1,
            watched: false,
          },
        ],
      });

      // 電影類型 - 星際效應
      await workStorage.create({
        title: "星際效應",
        type: "電影",
        status: "已完結",
        year: 2014,
        rating: 5,
        review: "諾蘭的科幻傑作，結合了硬科幻與人文情感，視覺效果震撼。",
        source: "手動新增",
        episodes: [
          {
            id: "movie-1",
            number: 1,
            title: "星際效應",
            description: "人類為了尋找新的家園而展開的星際旅程",
            type: "movie",
            season: 1,
            watched: true,
            date_watched: "2023-02-10T00:00:00.000Z",
          },
        ],
      });

      // 電視劇類型 - 權力遊戲
      await workStorage.create({
        title: "權力遊戲",
        type: "電視劇",
        status: "已完結",
        year: 2011,
        rating: 4,
        review: "史詩級奇幻劇集，政治鬥爭與奇幻元素完美結合。",
        source: "手動新增",
        episodes: [
          {
            id: "ep-1",
            number: 1,
            title: "凜冬將至",
            description: "史塔克家族發現冰原狼幼崽",
            type: "episode",
            season: 1,
            watched: true,
            date_watched: "2023-03-05T00:00:00.000Z",
          },
          {
            id: "ep-2",
            number: 2,
            title: "國王大道",
            description: "艾德·史塔克前往君臨城",
            type: "episode",
            season: 1,
            watched: true,
            date_watched: "2023-03-05T00:00:00.000Z",
          },
          {
            id: "ep-3",
            number: 3,
            title: "雪諾，私生子",
            description: "瓊恩·雪諾加入守夜人",
            type: "episode",
            season: 1,
            watched: false,
          },
        ],
      });

      // 小說類型 - 哈利波特與魔法石
      await workStorage.create({
        title: "哈利波特與魔法石",
        type: "小說",
        status: "已完結",
        year: 1997,
        rating: 5,
        review: "魔法世界的開始，J.K.羅琳的奇幻傑作。",
        source: "手動新增",
        episodes: [
          {
            id: "ch-1",
            number: 1,
            title: "活下來的男孩",
            description: "哈利波特被送到德思禮家",
            type: "chapter",
            season: 1,
            watched: true,
            date_watched: "2023-03-01T00:00:00.000Z",
          },
          {
            id: "ch-2",
            number: 2,
            title: "消失的玻璃",
            description: "哈利發現自己的魔法能力",
            type: "chapter",
            season: 1,
            watched: true,
            date_watched: "2023-03-01T00:00:00.000Z",
          },
          {
            id: "ch-3",
            number: 3,
            title: "來自霍格華茲的信",
            description: "哈利收到霍格華茲的入學通知",
            type: "chapter",
            season: 1,
            watched: false,
          },
        ],
      });

      // 漫畫類型 - 鬼滅之刃
      await workStorage.create({
        title: "鬼滅之刃",
        type: "漫畫",
        status: "進行中",
        year: 2016,
        rating: 4,
        review: "熱血戰鬥漫畫，畫風精美，劇情緊湊。",
        source: "手動新增",
        episodes: [
          {
            id: "ch-1",
            number: 1,
            title: "殘酷",
            description: "竈門炭治郎的家人被鬼襲擊",
            type: "chapter",
            season: 1,
            watched: true,
            date_watched: "2023-04-01T00:00:00.000Z",
          },
          {
            id: "ch-2",
            number: 2,
            title: "培育者 鱗瀧左近次",
            description: "炭治郎開始學習呼吸法",
            type: "chapter",
            season: 1,
            watched: true,
            date_watched: "2023-04-01T00:00:00.000Z",
          },
          {
            id: "ch-3",
            number: 3,
            title: "鬼舞辻無慘",
            description: "炭治郎遇到鬼舞辻無慘",
            type: "chapter",
            season: 1,
            watched: false,
          },
        ],
      });
    }

    if (tags.length === 0) {
      // 新增示例標籤
      await tagStorage.create({ name: "神作", color: "#FF6B6B" });
      await tagStorage.create({ name: "熱血", color: "#4ECDC4" });
      await tagStorage.create({ name: "劇情", color: "#45B7D1" });
      await tagStorage.create({ name: "魔法", color: "#96CEB4" });
      await tagStorage.create({ name: "冒險", color: "#FFEAA7" });
      await tagStorage.create({ name: "科幻", color: "#A8E6CF" });
      await tagStorage.create({ name: "奇幻", color: "#FFB3BA" });
      await tagStorage.create({ name: "動作", color: "#FFD93D" });
    }
  } catch (error) {
    console.error("初始化示例數據失敗:", error);
  }
};

// 資料庫管理工具
export const dbUtils = {
  // 清空所有數據
  async clearAll(): Promise<void> {
    try {
      await dbManager.clear(STORES.WORKS);
      await dbManager.clear(STORES.TAGS);
    } catch (error) {
      console.error("清空數據失敗:", error);
    }
  },

  // 匯出所有數據
  async exportData(): Promise<{ works: Work[]; tags: Tag[] }> {
    try {
      const works = await workStorage.getAll();
      const tags = await tagStorage.getAll();
      return { works, tags };
    } catch (error) {
      console.error("匯出數據失敗:", error);
      return { works: [], tags: [] };
    }
  },

  // 匯入數據
  async importData(data: { works: Work[]; tags: Tag[] }): Promise<void> {
    try {
      await workStorage.setAll(data.works);
      await tagStorage.setAll(data.tags);
    } catch (error) {
      console.error("匯入數據失敗:", error);
    }
  },

  // 檢查資料庫狀態
  async getDatabaseInfo(): Promise<{
    worksCount: number;
    tagsCount: number;
    dbSize?: number;
  }> {
    try {
      const works = await workStorage.getAll();
      const tags = await tagStorage.getAll();

      return {
        worksCount: works.length,
        tagsCount: tags.length,
      };
    } catch (error) {
      console.error("取得資料庫信息失敗:", error);
      return {
        worksCount: 0,
        tagsCount: 0,
      };
    }
  },
};
