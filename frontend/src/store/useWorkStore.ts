import { create } from "zustand";
import { Work, WorkCreate, WorkUpdate, WorkList, Tag, Stats } from "@/types";
import {
  workStorage,
  tagStorage,
  initializeSampleData,
} from "@/lib/localStorage";

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
  createWork: (work: WorkCreate) => Work;
  updateWork: (id: string, work: WorkUpdate) => Promise<Work | null>;
  deleteWork: (id: string) => Promise<boolean>;
  getWork: (id: string) => Work | null;
  updateWorks: (works: Work[]) => void;

  // 標籤相關操作
  fetchTags: () => Promise<Tag[]>;
  createTag: (tag: { name: string; color: string }) => Promise<Tag>;
  updateTag: (
    id: number,
    tag: { name?: string; color?: string }
  ) => Promise<Tag | null>;
  deleteTag: (id: number) => Promise<boolean>;
  updateTags: (tags: Tag[]) => void;

  // 統計相關操作
  fetchStats: () => Promise<Stats>;

  // 初始化
  initialize: () => void;
}

export const useWorkStore = create<WorkStore>((set, get) => ({
  // 初始狀態
  works: [],
  tags: [],
  stats: null,
  loading: false,
  error: null,

  // 初始化
  initialize: () => {
    // 只在沒有數據時初始化示例數據
    const works = workStorage.getAll();
    if (works.length === 0) {
      initializeSampleData();
    }

    const updatedWorks = workStorage.getAll();
    const tags = tagStorage.getAll();
    const stats = workStorage.getStats();

    set({ works: updatedWorks, tags, stats });
  },

  // 作品相關操作
  fetchWorks: async (params) => {
    set({ loading: true, error: null });

    try {
      const result = workStorage.getList(params);
      set({ works: result.works, loading: false });
      return result;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "取得作品列表失敗";
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },

  createWork: (workData) => {
    set({ loading: true, error: null });

    try {
      // 檢查標題重複（所有作品都檢查）
      const existingByTitle = workStorage.findByTitle(workData.title);

      if (existingByTitle) {
        throw new Error(`作品「${workData.title}」已存在於您的收藏中！`);
      }

      // 如果是來自 AniList 的作品，額外檢查 AniList ID
      if (workData.source === "AniList" && workData.note) {
        const aniListIdMatch = workData.note.match(/AniList ID: (\d+)/);
        if (aniListIdMatch) {
          const aniListId = parseInt(aniListIdMatch[1]);
          const existingByAniListId = workStorage.findByAniListId(aniListId);
          if (existingByAniListId) {
            throw new Error(`作品「${workData.title}」已存在於您的收藏中！`);
          }
        }
      }

      const newWork = workStorage.create(workData);
      const works = workStorage.getAll();
      const stats = workStorage.getStats();

      set({ works, stats, loading: false });
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
      const updatedWork = workStorage.update(id, workData);
      if (!updatedWork) {
        throw new Error("作品不存在");
      }

      const works = workStorage.getAll();
      const stats = workStorage.getStats();

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
      const success = workStorage.delete(id);
      if (!success) {
        throw new Error("作品不存在");
      }

      const works = workStorage.getAll();
      const stats = workStorage.getStats();

      set({ works, stats, loading: false });
      return true;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "刪除作品失敗";
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },

  getWork: (id) => {
    const works = workStorage.getAll();
    return works.find((w) => w.id === id) || null;
  },

  updateWorks: (works) => {
    try {
      // 更新本地儲存
      workStorage.setAll(works);
      set({ works });
    } catch (error) {
      console.error("更新作品失敗:", error);
    }
  },

  // 標籤相關操作
  fetchTags: async () => {
    set({ loading: true, error: null });

    try {
      const tags = tagStorage.getAll();
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
      const newTag = tagStorage.create(tagData);
      const tags = tagStorage.getAll();

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
      const updatedTag = tagStorage.update(id, tagData);
      if (!updatedTag) {
        throw new Error("標籤不存在");
      }

      const tags = tagStorage.getAll();
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
      const success = tagStorage.delete(id);
      if (!success) {
        throw new Error("標籤不存在");
      }

      const tags = tagStorage.getAll();
      set({ tags, loading: false });
      return true;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "刪除標籤失敗";
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },

  updateTags: (tags) => {
    try {
      // 更新本地儲存
      tagStorage.setAll(tags);
      set({ tags });
    } catch (error) {
      console.error("更新標籤失敗:", error);
    }
  },

  // 統計相關操作
  fetchStats: async () => {
    set({ loading: true, error: null });

    try {
      const stats = workStorage.getStats();
      set({ stats, loading: false });
      return stats;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "取得統計數據失敗";
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },
}));
