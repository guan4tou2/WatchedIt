import { workStorage, tagStorage } from "../localStorage";
import { Work, WorkCreate, Episode } from "@/types";

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, "localStorage", {
  value: mockLocalStorage,
});

describe("localStorage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue(null);
  });

  describe("workStorage", () => {
    const mockWork: WorkCreate = {
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

    const mockEpisode: Episode = {
      id: "ep-1",
      number: 1,
      title: "第一集",
      description: "測試描述",
      type: "episode",
      season: 1,
      watched: false,
      date_watched: undefined,
      note: "",
    };

    describe("create", () => {
      it("應該成功創建新作品", () => {
        const work = workStorage.create(mockWork);

        expect(work.id).toBeDefined();
        expect(work.title).toBe(mockWork.title);
        expect(work.type).toBe(mockWork.type);
        expect(work.status).toBe(mockWork.status);
        expect(work.episodes).toEqual([]);
        expect(work.reminder_enabled).toBe(false);
        expect(mockLocalStorage.setItem).toHaveBeenCalled();
      });

      it("應該為新作品生成唯一ID", () => {
        const work1 = workStorage.create(mockWork);
        const work2 = workStorage.create(mockWork);

        expect(work1.id).not.toBe(work2.id);
      });
    });

    describe("getAll", () => {
      it("應該返回所有作品", () => {
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
            status: "已完成",
            episodes: [],
          },
        ];

        mockLocalStorage.getItem.mockReturnValue(JSON.stringify(mockWorks));

        const works = workStorage.getAll();

        expect(works).toEqual(mockWorks);
        expect(mockLocalStorage.getItem).toHaveBeenCalledWith(
          "watchedit_works"
        );
      });

      it("當沒有數據時應該返回空陣列", () => {
        mockLocalStorage.getItem.mockReturnValue(null);

        const works = workStorage.getAll();

        expect(works).toEqual([]);
      });
    });

    describe("findByTitle", () => {
      it("應該根據標題找到作品", () => {
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
            status: "已完成",
            episodes: [],
          },
        ];

        mockLocalStorage.getItem.mockReturnValue(JSON.stringify(mockWorks));

        const work = workStorage.findByTitle("作品1");

        expect(work).toEqual(mockWorks[0]);
      });

      it("當找不到作品時應該返回 undefined", () => {
        const mockWorks = [
          {
            id: "1",
            title: "作品1",
            type: "動畫",
            status: "進行中",
            episodes: [],
          },
        ];

        mockLocalStorage.getItem.mockReturnValue(JSON.stringify(mockWorks));

        const work = workStorage.findByTitle("不存在的作品");

        expect(work).toBeNull();
      });
    });

    describe("findByAniListId", () => {
      it("應該根據 AniList ID 找到作品", () => {
        const mockWorks = [
          {
            id: "1",
            title: "作品1",
            type: "動畫",
            status: "進行中",
            episodes: [],
            aniListId: 123,
          },
          {
            id: "2",
            title: "作品2",
            type: "電影",
            status: "已完成",
            episodes: [],
            aniListId: 456,
          },
        ];

        mockLocalStorage.getItem.mockReturnValue(JSON.stringify(mockWorks));

        const work = workStorage.findByAniListId(123);

        expect(work).toEqual(mockWorks[0]);
      });

      it("當找不到作品時應該返回 undefined", () => {
        const mockWorks = [
          {
            id: "1",
            title: "作品1",
            type: "動畫",
            status: "進行中",
            episodes: [],
            aniListId: 123,
          },
        ];

        mockLocalStorage.getItem.mockReturnValue(JSON.stringify(mockWorks));

        const work = workStorage.findByAniListId(999);

        expect(work).toBeNull();
      });
    });

    describe("update", () => {
      it("應該成功更新作品", () => {
        const mockWorks = [
          {
            id: "1",
            title: "作品1",
            type: "動畫",
            status: "進行中",
            episodes: [],
          },
        ];

        mockLocalStorage.getItem.mockReturnValue(JSON.stringify(mockWorks));

        const updatedWork = workStorage.update("1", { title: "更新後的標題" });

        expect(updatedWork?.title).toBe("更新後的標題");
        expect(mockLocalStorage.setItem).toHaveBeenCalled();
      });

      it("當作品不存在時應該返回 undefined", () => {
        const mockWorks = [
          {
            id: "1",
            title: "作品1",
            type: "動畫",
            status: "進行中",
            episodes: [],
          },
        ];

        mockLocalStorage.getItem.mockReturnValue(JSON.stringify(mockWorks));

        const updatedWork = workStorage.update("999", {
          title: "更新後的標題",
        });

        expect(updatedWork).toBeNull();
      });
    });

    describe("delete", () => {
      it("應該成功刪除作品", () => {
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
            status: "已完成",
            episodes: [],
          },
        ];

        mockLocalStorage.getItem.mockReturnValue(JSON.stringify(mockWorks));

        const result = workStorage.delete("1");

        expect(result).toBe(true);
        expect(mockLocalStorage.setItem).toHaveBeenCalled();
      });

      it("當作品不存在時應該返回 false", () => {
        const mockWorks = [
          {
            id: "1",
            title: "作品1",
            type: "動畫",
            status: "進行中",
            episodes: [],
          },
        ];

        mockLocalStorage.getItem.mockReturnValue(JSON.stringify(mockWorks));

        const result = workStorage.delete("999");

        expect(result).toBe(false);
      });
    });

    describe("getStats", () => {
      it("應該正確計算統計數據", () => {
        const mockWorks = [
          {
            id: "1",
            title: "作品1",
            type: "動畫",
            status: "進行中",
            episodes: [mockEpisode],
          },
          {
            id: "2",
            title: "作品2",
            type: "電影",
            status: "已完成",
            episodes: [mockEpisode, mockEpisode],
          },
          {
            id: "3",
            title: "作品3",
            type: "動畫",
            status: "進行中",
            episodes: [],
          },
        ];

        mockLocalStorage.getItem.mockReturnValue(JSON.stringify(mockWorks));

        const stats = workStorage.getStats();

        expect(stats.total_works).toBe(3);
        expect(stats.type_stats["動畫"]).toBe(2);
        expect(stats.type_stats["電影"]).toBe(1);
        expect(stats.status_stats["進行中"]).toBe(2);
        expect(stats.status_stats["已完成"]).toBe(1);
        expect(stats.episode_stats.total_episodes).toBe(3);
        expect(stats.episode_stats.watched_episodes).toBe(0);
      });
    });
  });

  describe("tagStorage", () => {
    const mockTag = {
      id: "1",
      name: "測試標籤",
      color: "#ff0000",
    };

    describe("create", () => {
      it("應該成功創建新標籤", () => {
        const tag = tagStorage.create({ name: "測試標籤", color: "#ff0000" });

        expect(tag.id).toBeDefined();
        expect(tag.name).toBe("測試標籤");
        expect(tag.color).toBe("#ff0000");
        expect(mockLocalStorage.setItem).toHaveBeenCalled();
      });
    });

    describe("getAll", () => {
      it("應該返回所有標籤", () => {
        const mockTags = [
          { id: "1", name: "標籤1", color: "#ff0000" },
          { id: "2", name: "標籤2", color: "#00ff00" },
        ];

        mockLocalStorage.getItem.mockReturnValue(JSON.stringify(mockTags));

        const tags = tagStorage.getAll();

        expect(tags).toEqual(mockTags);
      });
    });
  });
});
