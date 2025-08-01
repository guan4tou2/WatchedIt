import { create } from "zustand";
import { Work, WorkCreate, WorkUpdate, WorkList, Tag, Stats } from "@/types";
import { workStorage, tagStorage, initializeSampleData } from "@/lib/indexedDB";
import { reminderService } from "@/lib/reminder";
import { backupService } from "@/lib/backup";

interface WorkStore {
  // 狀態
  works: Work[];
  tags: Tag[];
  stats: Stats | null;
  loading: boolean;
  error: string | null;

  // 作品相關操作
  fetchWorks: (params?: {
    page?: number;
    size?: number;
    title?: string;
    type?: string;
    status?: string;
    year?: number;
    tag_ids?: number[];
  }) => Promise<WorkList>;
  createWork: (work: WorkCreate) => Promise<Work>;
  updateWork: (id: string, work: WorkUpdate) => Promise<Work | null>;
  deleteWork: (id: string) => Promise<boolean>;
  getWork: (id: string) => Promise<Work | null>;
  updateWorks: (works: Work[]) => Promise<void>;

  // 標籤相關操作
  fetchTags: () => Promise<Tag[]>;
  createTag: (tag: { name: string; color: string }) => Promise<Tag>;
  updateTag: (
    id: number,
    tag: { name?: string; color?: string }
  ) => Promise<Tag | null>;
  deleteTag: (id: number) => Promise<boolean>;
  updateTags: (tags: Tag[]) => Promise<void>;

  // 統計相關操作
  fetchStats: () => Promise<Stats>;

  // 初始化
  initialize: () => Promise<void>;

  // 提醒相關操作
  checkReminders: () => Promise<void>;
  testReminder: (workTitle?: string) => Promise<void>;

  // 備份相關操作
  createBackup: () => Promise<any>;
  restoreBackup: (backupData: any) => Promise<void>;

  // 重置示例數據標記
  resetSampleDataFlag: () => void;
}

export const useWorkStore = create<WorkStore>((set, get) => ({
  // 初始狀態
  works: [],
  tags: [],
  stats: null,
  loading: false,
  error: null,

  // 初始化
  initialize: async () => {
    try {
      // 初始化 IndexedDB
      await workStorage.init();
      await tagStorage.init();

      // 檢查是否已經初始化過示例數據
      const hasInitialized = localStorage.getItem(
        "watchedit_sample_initialized"
      );

      // 只在沒有數據且未初始化過示例數據時才初始化
      const works = await workStorage.getAll();
      if (works.length === 0 && !hasInitialized) {
        await initializeSampleData();
        // 標記已初始化
        localStorage.setItem("watchedit_sample_initialized", "true");
      }

      const updatedWorks = await workStorage.getAll();
      const tags = await tagStorage.getAll();
      const stats = await workStorage.getStats();

      set({ works: updatedWorks, tags, stats });

      // 初始化提醒服務
      await reminderService.initialize();
    } catch (error) {
      console.error("初始化失敗:", error);
      set({ error: "初始化失敗" });
    }
  },

  // 作品相關操作
  fetchWorks: async (params) => {
    set({ loading: true, error: null });

    try {
      const result = await workStorage.getList(params);
      set({ works: result.works, loading: false });
      return result;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "取得作品列表失敗";
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },

  createWork: async (workData) => {
    set({ loading: true, error: null });

    try {
      // 檢查標題重複（所有作品都檢查）
      const existingByTitle = await workStorage.findByTitle(workData.title);

      if (existingByTitle) {
        throw new Error(`作品「${workData.title}」已存在於您的收藏中！`);
      }

      // 如果是來自 AniList 的作品，額外檢查 AniList ID
      if (workData.source === "AniList" && workData.note) {
        const aniListIdMatch = workData.note.match(/AniList ID: (\d+)/);
        if (aniListIdMatch) {
          const aniListId = parseInt(aniListIdMatch[1]);
          const existingByAniListId = await workStorage.findByAniListId(
            aniListId
          );
          if (existingByAniListId) {
            throw new Error(`作品「${workData.title}」已存在於您的收藏中！`);
          }
        }
      }

      const newWork = await workStorage.create(workData);
      const works = await workStorage.getAll();
      const stats = await workStorage.getStats();

      set({ works, stats, loading: false });
      console.log("createWork: 新增作品成功，更新狀態", {
        worksCount: works.length,
        newWork,
      });
      return newWork;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "新增作品失敗";
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },

  updateWork: async (id, workData) => {
    set({ loading: true, error: null });

    try {
      const updatedWork = await workStorage.update(id, workData);
      if (!updatedWork) {
        throw new Error("作品不存在");
      }

      const works = await workStorage.getAll();
      const stats = await workStorage.getStats();

      set({ works, stats, loading: false });
      return updatedWork;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "更新作品失敗";
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },

  deleteWork: async (id) => {
    set({ loading: true, error: null });

    try {
      const success = await workStorage.delete(id);
      if (!success) {
        throw new Error("作品不存在");
      }

      const works = await workStorage.getAll();
      const stats = await workStorage.getStats();

      set({ works, stats, loading: false });
      return true;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "刪除作品失敗";
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },

  getWork: async (id) => {
    try {
      const works = await workStorage.getAll();
      return works.find((w) => w.id === id) || null;
    } catch (error) {
      console.error("取得作品失敗:", error);
      return null;
    }
  },

  updateWorks: async (works) => {
    try {
      // 更新本地儲存
      await workStorage.setAll(works);
      set({ works });
    } catch (error) {
      console.error("更新作品失敗:", error);
    }
  },

  // 標籤相關操作
  fetchTags: async () => {
    set({ loading: true, error: null });

    try {
      const tags = await tagStorage.getAll();
      set({ tags, loading: false });
      return tags;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "取得標籤列表失敗";
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },

  createTag: async (tagData) => {
    set({ loading: true, error: null });

    try {
      const newTag = await tagStorage.create(tagData);
      const tags = await tagStorage.getAll();

      set({ tags, loading: false });
      return newTag;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "新增標籤失敗";
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },

  updateTag: async (id, tagData) => {
    set({ loading: true, error: null });

    try {
      const updatedTag = await tagStorage.update(id, tagData);
      if (!updatedTag) {
        throw new Error("標籤不存在");
      }

      const tags = await tagStorage.getAll();
      set({ tags, loading: false });
      return updatedTag;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "更新標籤失敗";
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },

  deleteTag: async (id) => {
    set({ loading: true, error: null });

    try {
      const success = await tagStorage.delete(id);
      if (!success) {
        throw new Error("標籤不存在");
      }

      const tags = await tagStorage.getAll();
      set({ tags, loading: false });
      return true;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "刪除標籤失敗";
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },

  updateTags: async (tags) => {
    try {
      // 更新本地儲存
      await tagStorage.setAll(tags);
      set({ tags });
    } catch (error) {
      console.error("更新標籤失敗:", error);
    }
  },

  // 統計相關操作
  fetchStats: async () => {
    set({ loading: true, error: null });

    try {
      const stats = await workStorage.getStats();
      set({ stats, loading: false });
      return stats;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "取得統計數據失敗";
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },

  // 提醒相關操作
  checkReminders: async () => {
    try {
      const { works } = get();
      await reminderService.checkAllReminders(works);
    } catch (error) {
      console.error("檢查提醒失敗:", error);
    }
  },

  testReminder: async (workTitle?: string) => {
    try {
      await reminderService.testReminder(workTitle);
    } catch (error) {
      console.error("測試提醒失敗:", error);
    }
  },

  // 備份相關操作
  createBackup: async () => {
    try {
      return await backupService.createBackup();
    } catch (error) {
      console.error("建立備份失敗:", error);
      throw error;
    }
  },

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

  // 重置示例數據標記
  resetSampleDataFlag: () => {
    localStorage.removeItem("watchedit_sample_initialized");
  },
}));
