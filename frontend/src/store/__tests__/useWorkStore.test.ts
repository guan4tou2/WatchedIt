import { act, renderHook } from "@testing-library/react";
import { initializeSampleData, tagStorage, workStorage } from "@/lib/indexedDB";
import { reminderService } from "@/lib/reminder";
import { Stats, Tag, Work, WorkCreate } from "@/types";
import { useWorkStore } from "../useWorkStore";

jest.mock("@/lib/indexedDB", () => ({
  initializeSampleData: jest.fn(),
  workStorage: {
    init: jest.fn(),
    getAll: jest.fn(),
    setAll: jest.fn(),
    getList: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    findByTitle: jest.fn(),
    findByAniListId: jest.fn(),
    getStats: jest.fn(),
  },
  tagStorage: {
    init: jest.fn(),
    getAll: jest.fn(),
    setAll: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
}));

jest.mock("@/lib/reminder", () => ({
  reminderService: {
    initialize: jest.fn(),
    checkAllReminders: jest.fn(),
    testReminder: jest.fn(),
  },
}));

jest.mock("@/lib/backup", () => ({
  backupService: {
    createBackup: jest.fn(),
    restoreBackup: jest.fn(),
  },
}));

const mockWorkStorage = workStorage as jest.Mocked<typeof workStorage>;
const mockTagStorage = tagStorage as jest.Mocked<typeof tagStorage>;
const mockInitializeSampleData =
  initializeSampleData as jest.MockedFunction<typeof initializeSampleData>;
const mockReminderService = reminderService as jest.Mocked<typeof reminderService>;

const mockStats: Stats = {
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

const makeWork = (overrides: Partial<Work> = {}): Work => ({
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
  tags: [],
  reminder_enabled: false,
  date_added: "2024-01-01",
  date_updated: undefined,
  ...overrides,
});

describe("useWorkStore", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    jest.spyOn(Storage.prototype, "getItem").mockReturnValue(null);
    jest.spyOn(Storage.prototype, "setItem").mockImplementation(() => undefined);
    useWorkStore.setState({
      works: [],
      tags: [],
      stats: null,
      loading: false,
      error: null,
      isSyncing: false,
    });

    mockWorkStorage.init.mockResolvedValue(undefined);
    mockTagStorage.init.mockResolvedValue(undefined);
    mockWorkStorage.getAll.mockResolvedValue([]);
    mockWorkStorage.getList.mockResolvedValue({
      works: [],
      total: 0,
      page: 1,
      size: 20,
    });
    mockWorkStorage.getStats.mockResolvedValue(mockStats);
    mockTagStorage.getAll.mockResolvedValue([]);
    mockInitializeSampleData.mockResolvedValue(undefined);
    mockReminderService.initialize.mockResolvedValue(undefined);
  });

  describe("initialize", () => {
    it("應該初始化 store 並載入數據", async () => {
      const mockWorks = [
        makeWork({ id: "1", title: "作品1" }),
        makeWork({ id: "2", title: "作品2", type: "電影", status: "已完結" }),
      ];
      const mockTags: Tag[] = [{ id: 1, name: "標籤1", color: "#ff0000" }];

      mockWorkStorage.getAll
        .mockResolvedValueOnce(mockWorks)
        .mockResolvedValueOnce(mockWorks);
      mockTagStorage.getAll.mockResolvedValue(mockTags);

      const { result } = renderHook(() => useWorkStore());

      await act(async () => {
        await result.current.initialize();
      });

      expect(result.current.works).toEqual(mockWorks);
      expect(result.current.tags).toEqual(mockTags);
      expect(result.current.stats).toEqual(mockStats);
      expect(mockReminderService.initialize).toHaveBeenCalled();
    });

    it("當沒有數據且未初始化過時應該初始化示例數據", async () => {
      mockWorkStorage.getAll.mockResolvedValue([]);

      const { result } = renderHook(() => useWorkStore());

      await act(async () => {
        await result.current.initialize();
      });

      expect(mockInitializeSampleData).toHaveBeenCalled();
      expect(Storage.prototype.setItem).toHaveBeenCalledWith(
        "watchedit_sample_initialized",
        "true"
      );
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

    it("應該成功創建新作品", async () => {
      const logSpy = jest.spyOn(console, "log").mockImplementation(() => {});
      const mockCreatedWork = makeWork();
      mockWorkStorage.findByTitle.mockResolvedValue(null);
      mockWorkStorage.create.mockResolvedValue(mockCreatedWork);
      mockWorkStorage.getAll.mockResolvedValue([mockCreatedWork]);

      const { result } = renderHook(() => useWorkStore());
      let createdWork: Work | undefined;

      await act(async () => {
        createdWork = await result.current.createWork(mockWorkData);
      });

      expect(createdWork).toEqual(mockCreatedWork);
      expect(result.current.works).toEqual([mockCreatedWork]);
      expect(mockWorkStorage.create).toHaveBeenCalledWith(mockWorkData);
      expect(logSpy).not.toHaveBeenCalled();
    });

    it("當作品標題已存在時應該拋出錯誤", async () => {
      mockWorkStorage.findByTitle.mockResolvedValue(makeWork());

      const { result } = renderHook(() => useWorkStore());

      await act(async () => {
        await expect(result.current.createWork(mockWorkData)).rejects.toThrow(
          "作品「測試作品」已存在於您的收藏中！"
        );
      });

      expect(mockWorkStorage.create).not.toHaveBeenCalled();
      expect(result.current.error).toBe("作品「測試作品」已存在於您的收藏中！");
    });

    it("當 AniList ID 已存在時應該拋出錯誤", async () => {
      const workWithAniListId: WorkCreate = {
        ...mockWorkData,
        source: "AniList",
        note: "AniList ID: 123",
      };
      mockWorkStorage.findByTitle.mockResolvedValue(null);
      mockWorkStorage.findByAniListId.mockResolvedValue(makeWork());

      const { result } = renderHook(() => useWorkStore());

      await act(async () => {
        await expect(result.current.createWork(workWithAniListId)).rejects.toThrow(
          "作品「測試作品」已存在於您的收藏中！"
        );
      });

      expect(mockWorkStorage.findByAniListId).toHaveBeenCalledWith(123);
      expect(mockWorkStorage.create).not.toHaveBeenCalled();
    });
  });

  describe("updateWork", () => {
    it("應該成功更新作品", async () => {
      const mockUpdatedWork = makeWork({ title: "更新後的標題" });
      mockWorkStorage.update.mockResolvedValue(mockUpdatedWork);
      mockWorkStorage.getAll.mockResolvedValue([mockUpdatedWork]);

      const { result } = renderHook(() => useWorkStore());
      let updatedWork: Work | null | undefined;

      await act(async () => {
        updatedWork = await result.current.updateWork("1", {
          title: "更新後的標題",
        });
      });

      expect(updatedWork).toEqual(mockUpdatedWork);
      expect(mockWorkStorage.update).toHaveBeenCalledWith("1", {
        title: "更新後的標題",
      });
      expect(result.current.works).toEqual([mockUpdatedWork]);
    });

    it("當作品不存在時應該拋出錯誤", async () => {
      mockWorkStorage.update.mockResolvedValue(null);

      const { result } = renderHook(() => useWorkStore());

      await act(async () => {
        await expect(
          result.current.updateWork("999", { title: "更新後的標題" })
        ).rejects.toThrow("作品不存在");
      });
    });
  });

  describe("deleteWork", () => {
    it("應該成功刪除作品", async () => {
      mockWorkStorage.delete.mockResolvedValue(true);

      const { result } = renderHook(() => useWorkStore());
      let success: boolean | undefined;

      await act(async () => {
        success = await result.current.deleteWork("1");
      });

      expect(success).toBe(true);
      expect(mockWorkStorage.delete).toHaveBeenCalledWith("1");
    });

    it("當作品不存在時應該拋出錯誤", async () => {
      mockWorkStorage.delete.mockResolvedValue(false);

      const { result } = renderHook(() => useWorkStore());

      await act(async () => {
        await expect(result.current.deleteWork("999")).rejects.toThrow(
          "作品不存在"
        );
      });
    });
  });

  describe("createTag", () => {
    it("應該成功創建新標籤", async () => {
      const mockTag: Tag = { id: 1, name: "測試標籤", color: "#ff0000" };
      mockTagStorage.create.mockResolvedValue(mockTag);
      mockTagStorage.getAll.mockResolvedValue([mockTag]);

      const { result } = renderHook(() => useWorkStore());
      let createdTag: Tag | undefined;

      await act(async () => {
        createdTag = await result.current.createTag({
          name: "測試標籤",
          color: "#ff0000",
        });
      });

      expect(createdTag).toEqual(mockTag);
      expect(result.current.tags).toEqual([mockTag]);
      expect(mockTagStorage.create).toHaveBeenCalledWith({
        name: "測試標籤",
        color: "#ff0000",
      });
    });
  });

  describe("updateTag", () => {
    it("應該成功更新標籤", async () => {
      const mockUpdatedTag: Tag = {
        id: 1,
        name: "更新後的標籤",
        color: "#ff0000",
      };
      mockTagStorage.update.mockResolvedValue(mockUpdatedTag);
      mockTagStorage.getAll.mockResolvedValue([mockUpdatedTag]);

      const { result } = renderHook(() => useWorkStore());
      let updatedTag: Tag | null | undefined;

      await act(async () => {
        updatedTag = await result.current.updateTag(1, {
          name: "更新後的標籤",
        });
      });

      expect(updatedTag).toEqual(mockUpdatedTag);
      expect(mockTagStorage.update).toHaveBeenCalledWith(1, {
        name: "更新後的標籤",
      });
    });
  });

  describe("deleteTag", () => {
    it("應該成功刪除標籤", async () => {
      mockTagStorage.delete.mockResolvedValue(true);

      const { result } = renderHook(() => useWorkStore());
      let success: boolean | undefined;

      await act(async () => {
        success = await result.current.deleteTag(1);
      });

      expect(success).toBe(true);
      expect(mockTagStorage.delete).toHaveBeenCalledWith(1);
    });
  });

  describe("fetchStats", () => {
    it("應該返回統計數據", async () => {
      const stats: Stats = {
        total_works: 5,
        type_stats: { 動畫: 3, 電影: 2 },
        status_stats: { 進行中: 2, 已完結: 3 },
        year_stats: { "2024": 5 },
        episode_stats: {
          total_episodes: 10,
          watched_episodes: 5,
          completion_rate: 50,
        },
      };

      mockWorkStorage.getStats.mockResolvedValue(stats);

      const { result } = renderHook(() => useWorkStore());
      let fetchedStats: Stats | undefined;

      await act(async () => {
        fetchedStats = await result.current.fetchStats();
      });

      expect(fetchedStats).toEqual(stats);
      expect(result.current.stats).toEqual(stats);
      expect(mockWorkStorage.getStats).toHaveBeenCalled();
    });
  });
});
