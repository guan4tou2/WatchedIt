import { renderHook, act } from "@testing-library/react";
import { useWorkStore } from "../useWorkStore";
import { workStorage, tagStorage } from "@/lib/localStorage";
import { WorkCreate, Work } from "@/types";

// Mock localStorage modules
jest.mock("../../lib/localStorage", () => ({
  workStorage: {
    getAll: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    findByTitle: jest.fn(),
    findByAniListId: jest.fn(),
    getStats: jest.fn(),
  },
  tagStorage: {
    getAll: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
}));

const mockWorkStorage = workStorage as jest.Mocked<typeof workStorage>;
const mockTagStorage = tagStorage as jest.Mocked<typeof tagStorage>;

describe("useWorkStore", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockWorkStorage.getAll.mockReturnValue([]);
    mockTagStorage.getAll.mockReturnValue([]);
  });

  describe("initialize", () => {
    it("應該初始化 store 並載入數據", () => {
      const mockWorks = [
        {
          id: "1",
          title: "作品1",
          type: "動畫",
          status: "進行中",
          episodes: [],
        },
        {
          id: "2",
          title: "作品2",
          type: "電影",
          status: "已完結",
          episodes: [],
        },
      ];
      const mockTags = [{ id: "1", name: "標籤1", color: "#ff0000" }];

      mockWorkStorage.getAll.mockReturnValue(mockWorks);
      mockTagStorage.getAll.mockReturnValue(mockTags);

      const { result } = renderHook(() => useWorkStore());

      act(() => {
        result.current.initialize();
      });

      expect(result.current.works).toEqual(mockWorks);
      expect(result.current.tags).toEqual(mockTags);
    });

    it("當沒有數據時應該初始化示例數據", () => {
      mockWorkStorage.getAll.mockReturnValue([]);
      mockTagStorage.getAll.mockReturnValue([]);

      const { result } = renderHook(() => useWorkStore());

      act(() => {
        result.current.initialize();
      });

      expect(mockWorkStorage.create).toHaveBeenCalled();
      expect(mockTagStorage.create).toHaveBeenCalled();
    });
  });

  describe("createWork", () => {
    const mockWorkData: WorkCreate = {
      title: "測試作品",
      type: "動畫",
      status: "進行中",
      year: 2024,
      rating: 8.5,
      review: "測試評論",
      note: "測試備註",
      source: "測試",
      episodes: [],
    };

    const mockCreatedWork: Work = {
      id: "1",
      title: "測試作品",
      type: "動畫",
      status: "進行中",
      year: 2024,
      rating: 8.5,
      review: "測試評論",
      note: "測試備註",
      source: "測試",
      episodes: [],
      reminder_enabled: false,
      date_created: "2024-01-01",
      date_updated: undefined,
    };

    it("應該成功創建新作品", () => {
      mockWorkStorage.create.mockReturnValue(mockCreatedWork);
      mockWorkStorage.findByTitle.mockReturnValue(undefined);

      const { result } = renderHook(() => useWorkStore());

      act(() => {
        const createdWork = result.current.createWork(mockWorkData);
        expect(createdWork).toEqual(mockCreatedWork);
      });

      expect(mockWorkStorage.create).toHaveBeenCalledWith(mockWorkData);
    });

    it("當作品標題已存在時應該拋出錯誤", () => {
      mockWorkStorage.findByTitle.mockReturnValue(mockCreatedWork);

      const { result } = renderHook(() => useWorkStore());

      act(() => {
        expect(() => {
          result.current.createWork(mockWorkData);
        }).toThrow("作品「測試作品」已存在於您的收藏中！");
      });

      expect(mockWorkStorage.create).not.toHaveBeenCalled();
    });

    it("當 AniList ID 已存在時應該拋出錯誤", () => {
      const workWithAniListId = { ...mockWorkData, aniListId: 123 };
      mockWorkStorage.findByTitle.mockReturnValue(undefined);
      mockWorkStorage.findByAniListId.mockReturnValue(mockCreatedWork);

      const { result } = renderHook(() => useWorkStore());

      act(() => {
        expect(() => {
          result.current.createWork(workWithAniListId);
        }).toThrow("此動畫已存在於您的收藏中！");
      });

      expect(mockWorkStorage.create).not.toHaveBeenCalled();
    });
  });

  describe("updateWork", () => {
    const mockWork: Work = {
      id: "1",
      title: "原標題",
      type: "動畫",
      status: "進行中",
      episodes: [],
      reminder_enabled: false,
      date_created: "2024-01-01",
      date_updated: undefined,
    };

    const mockUpdatedWork: Work = {
      ...mockWork,
      title: "更新後的標題",
    };

    it("應該成功更新作品", () => {
      mockWorkStorage.update.mockReturnValue(mockUpdatedWork);

      const { result } = renderHook(() => useWorkStore());

      act(() => {
        const updatedWork = result.current.updateWork("1", {
          title: "更新後的標題",
        });
        expect(updatedWork).toEqual(mockUpdatedWork);
      });

      expect(mockWorkStorage.update).toHaveBeenCalledWith("1", {
        title: "更新後的標題",
      });
    });

    it("當作品不存在時應該拋出錯誤", () => {
      mockWorkStorage.update.mockReturnValue(undefined);

      const { result } = renderHook(() => useWorkStore());

      act(() => {
        expect(() => {
          result.current.updateWork("999", { title: "更新後的標題" });
        }).toThrow("作品不存在");
      });
    });
  });

  describe("deleteWork", () => {
    it("應該成功刪除作品", () => {
      mockWorkStorage.delete.mockReturnValue(true);

      const { result } = renderHook(() => useWorkStore());

      act(() => {
        const success = result.current.deleteWork("1");
        expect(success).toBe(true);
      });

      expect(mockWorkStorage.delete).toHaveBeenCalledWith("1");
    });

    it("當作品不存在時應該返回 false", () => {
      mockWorkStorage.delete.mockReturnValue(false);

      const { result } = renderHook(() => useWorkStore());

      act(() => {
        const success = result.current.deleteWork("999");
        expect(success).toBe(false);
      });
    });
  });

  describe("createTag", () => {
    const mockTag = {
      id: "1",
      name: "測試標籤",
      color: "#ff0000",
    };

    it("應該成功創建新標籤", () => {
      mockTagStorage.create.mockReturnValue(mockTag);

      const { result } = renderHook(() => useWorkStore());

      act(() => {
        const createdTag = result.current.createTag({
          name: "測試標籤",
          color: "#ff0000",
        });
        expect(createdTag).toEqual(mockTag);
      });

      expect(mockTagStorage.create).toHaveBeenCalledWith({
        name: "測試標籤",
        color: "#ff0000",
      });
    });
  });

  describe("updateTag", () => {
    const mockTag = {
      id: "1",
      name: "原標籤",
      color: "#ff0000",
    };

    const mockUpdatedTag = {
      ...mockTag,
      name: "更新後的標籤",
    };

    it("應該成功更新標籤", () => {
      mockTagStorage.update.mockReturnValue(mockUpdatedTag);

      const { result } = renderHook(() => useWorkStore());

      act(() => {
        const updatedTag = result.current.updateTag("1", {
          name: "更新後的標籤",
        });
        expect(updatedTag).toEqual(mockUpdatedTag);
      });

      expect(mockTagStorage.update).toHaveBeenCalledWith("1", {
        name: "更新後的標籤",
      });
    });
  });

  describe("deleteTag", () => {
    it("應該成功刪除標籤", () => {
      mockTagStorage.delete.mockReturnValue(true);

      const { result } = renderHook(() => useWorkStore());

      act(() => {
        const success = result.current.deleteTag("1");
        expect(success).toBe(true);
      });

      expect(mockTagStorage.delete).toHaveBeenCalledWith("1");
    });
  });

  describe("getStats", () => {
    it("應該返回統計數據", () => {
      const mockStats = {
        total_works: 5,
        type_stats: { 動畫: 3, 電影: 2 },
        status_stats: { 進行中: 2, 已完成: 3 },
        episode_stats: { total_episodes: 10, watched_episodes: 5 },
      };

      mockWorkStorage.getStats.mockReturnValue(mockStats);

      const { result } = renderHook(() => useWorkStore());

      act(() => {
        const stats = result.current.getStats();
        expect(stats).toEqual(mockStats);
      });

      expect(mockWorkStorage.getStats).toHaveBeenCalled();
    });
  });
});
