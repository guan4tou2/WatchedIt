import { create } from "zustand";
import { Work, WorkCreate, WorkUpdate, WorkList, Tag, Stats } from "@/types";
import { apiClient } from "@/lib/api";

interface WorkStore {
  works: Work[];
  tags: Tag[];
  stats: Stats | null;
  loading: boolean;
  error: string | null;

  // 作品相關
  fetchWorks: (params?: any) => Promise<void>;
  fetchWork: (id: string) => Promise<Work | null>;
  createWork: (work: WorkCreate) => Promise<void>;
  updateWork: (id: string, work: WorkUpdate) => Promise<void>;
  deleteWork: (id: string) => Promise<void>;

  // 標籤相關
  fetchTags: () => Promise<void>;
  createTag: (tag: { name: string; color: string }) => Promise<void>;
  updateTag: (
    id: number,
    tag: { name?: string; color?: string }
  ) => Promise<void>;
  deleteTag: (id: number) => Promise<void>;

  // 統計相關
  fetchStats: () => Promise<void>;

  // 工具方法
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

export const useWorkStore = create<WorkStore>((set, get) => ({
  works: [],
  tags: [],
  stats: null,
  loading: false,
  error: null,

  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),

  fetchWorks: async (params) => {
    try {
      set({ loading: true, error: null });
      const workList = await apiClient.getWorks(params);
      set({ works: workList.works });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "取得作品列表失敗",
      });
    } finally {
      set({ loading: false });
    }
  },

  fetchWork: async (id) => {
    try {
      set({ loading: true, error: null });
      const work = await apiClient.getWork(id);
      return work;
    } catch (error) {
      set({ error: error instanceof Error ? error.message : "取得作品失敗" });
      return null;
    } finally {
      set({ loading: false });
    }
  },

  createWork: async (work) => {
    try {
      set({ loading: true, error: null });
      await apiClient.createWork(work);
      // 重新取得作品列表
      await get().fetchWorks();
    } catch (error) {
      set({ error: error instanceof Error ? error.message : "建立作品失敗" });
    } finally {
      set({ loading: false });
    }
  },

  updateWork: async (id, work) => {
    try {
      set({ loading: true, error: null });
      await apiClient.updateWork(id, work);
      // 重新取得作品列表
      await get().fetchWorks();
    } catch (error) {
      set({ error: error instanceof Error ? error.message : "更新作品失敗" });
    } finally {
      set({ loading: false });
    }
  },

  deleteWork: async (id) => {
    try {
      set({ loading: true, error: null });
      await apiClient.deleteWork(id);
      // 重新取得作品列表
      await get().fetchWorks();
    } catch (error) {
      set({ error: error instanceof Error ? error.message : "刪除作品失敗" });
    } finally {
      set({ loading: false });
    }
  },

  fetchTags: async () => {
    try {
      set({ loading: true, error: null });
      const tags = await apiClient.getTags();
      set({ tags });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : "取得標籤失敗" });
    } finally {
      set({ loading: false });
    }
  },

  createTag: async (tag) => {
    try {
      set({ loading: true, error: null });
      await apiClient.createTag(tag);
      // 重新取得標籤列表
      await get().fetchTags();
    } catch (error) {
      set({ error: error instanceof Error ? error.message : "建立標籤失敗" });
    } finally {
      set({ loading: false });
    }
  },

  updateTag: async (id, tag) => {
    try {
      set({ loading: true, error: null });
      await apiClient.updateTag(id, tag);
      // 重新取得標籤列表
      await get().fetchTags();
    } catch (error) {
      set({ error: error instanceof Error ? error.message : "更新標籤失敗" });
    } finally {
      set({ loading: false });
    }
  },

  deleteTag: async (id) => {
    try {
      set({ loading: true, error: null });
      await apiClient.deleteTag(id);
      // 重新取得標籤列表
      await get().fetchTags();
    } catch (error) {
      set({ error: error instanceof Error ? error.message : "刪除標籤失敗" });
    } finally {
      set({ loading: false });
    }
  },

  fetchStats: async () => {
    try {
      set({ loading: true, error: null });
      const stats = await apiClient.getStats();
      set({ stats });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : "取得統計失敗" });
    } finally {
      set({ loading: false });
    }
  },
}));
