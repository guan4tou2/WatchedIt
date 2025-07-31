import { workTypeEpisodeMappingStorage } from "../workTypeEpisodeMapping";
import { DEFAULT_WORK_TYPE_EPISODE_MAPPING, EpisodeType } from "@/types";

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

Object.defineProperty(window, "localStorage", { value: mockLocalStorage });

describe("workTypeEpisodeMappingStorage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue(null);
  });

  describe("getAll", () => {
    it("應該返回預設對應關係當沒有儲存數據時", () => {
      const mappings = workTypeEpisodeMappingStorage.getAll();
      expect(mappings).toEqual(DEFAULT_WORK_TYPE_EPISODE_MAPPING);
    });

    it("應該返回儲存的對應關係", () => {
      const testMappings = [
        {
          workType: "測試動畫",
          episodeTypes: ["episode", "special"] as EpisodeType[],
          defaultEpisodeType: "episode" as EpisodeType,
        },
      ];
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(testMappings));

      const mappings = workTypeEpisodeMappingStorage.getAll();
      expect(mappings).toEqual(testMappings);
    });
  });

  describe("getEpisodeTypesForWorkType", () => {
    it("應該返回動畫的集數類型", () => {
      const episodeTypes =
        workTypeEpisodeMappingStorage.getEpisodeTypesForWorkType("動畫");
      expect(episodeTypes).toEqual(["episode", "special", "ova", "movie"]);
    });

    it("應該返回電影的集數類型", () => {
      const episodeTypes =
        workTypeEpisodeMappingStorage.getEpisodeTypesForWorkType("電影");
      expect(episodeTypes).toEqual(["movie"]);
    });

    it("應該返回預設類型當找不到對應關係時", () => {
      const episodeTypes =
        workTypeEpisodeMappingStorage.getEpisodeTypesForWorkType(
          "不存在的類型"
        );
      expect(episodeTypes).toEqual(["episode"]);
    });
  });

  describe("getDefaultEpisodeTypeForWorkType", () => {
    it("應該返回動畫的預設集數類型", () => {
      const defaultType =
        workTypeEpisodeMappingStorage.getDefaultEpisodeTypeForWorkType("動畫");
      expect(defaultType).toBe("episode");
    });

    it("應該返回電影的預設集數類型", () => {
      const defaultType =
        workTypeEpisodeMappingStorage.getDefaultEpisodeTypeForWorkType("電影");
      expect(defaultType).toBe("movie");
    });

    it("應該返回預設類型當找不到對應關係時", () => {
      const defaultType =
        workTypeEpisodeMappingStorage.getDefaultEpisodeTypeForWorkType(
          "不存在的類型"
        );
      expect(defaultType).toBe("episode");
    });
  });

  describe("create", () => {
    it("應該成功創建新的對應關係", () => {
      const newMapping = {
        workType: "測試類型",
        episodeTypes: ["episode", "special"] as EpisodeType[],
        defaultEpisodeType: "episode" as EpisodeType,
      };

      const result = workTypeEpisodeMappingStorage.create(newMapping);
      expect(result).toEqual(newMapping);
      expect(mockLocalStorage.setItem).toHaveBeenCalled();
    });

    it("應該拋出錯誤當作品類型已存在", () => {
      const existingMappings = [
        {
          workType: "測試類型",
          episodeTypes: ["episode"] as EpisodeType[],
          defaultEpisodeType: "episode" as EpisodeType,
        },
      ];
      mockLocalStorage.getItem.mockReturnValue(
        JSON.stringify(existingMappings)
      );

      const newMapping = {
        workType: "測試類型",
        episodeTypes: ["episode", "special"] as EpisodeType[],
        defaultEpisodeType: "episode" as EpisodeType,
      };

      expect(() => {
        workTypeEpisodeMappingStorage.create(newMapping);
      }).toThrow("作品類型「測試類型」的對應關係已存在");
    });
  });

  describe("update", () => {
    it("應該成功更新對應關係", () => {
      const existingMappings = [
        {
          workType: "測試類型",
          episodeTypes: ["episode"] as EpisodeType[],
          defaultEpisodeType: "episode" as EpisodeType,
        },
      ];
      mockLocalStorage.getItem.mockReturnValue(
        JSON.stringify(existingMappings)
      );

      const updatedMapping = workTypeEpisodeMappingStorage.update("測試類型", {
        episodeTypes: ["episode", "special"] as EpisodeType[],
        defaultEpisodeType: "special" as EpisodeType,
      });

      expect(updatedMapping).toEqual({
        workType: "測試類型",
        episodeTypes: ["episode", "special"],
        defaultEpisodeType: "special",
      });
    });

    it("應該返回 null 當作品類型不存在", () => {
      const result = workTypeEpisodeMappingStorage.update("不存在的類型", {
        episodeTypes: ["episode"] as EpisodeType[],
      });

      expect(result).toBeNull();
    });
  });

  describe("delete", () => {
    it("應該成功刪除對應關係", () => {
      const existingMappings = [
        {
          workType: "測試類型",
          episodeTypes: ["episode"] as EpisodeType[],
          defaultEpisodeType: "episode" as EpisodeType,
        },
      ];
      mockLocalStorage.getItem.mockReturnValue(
        JSON.stringify(existingMappings)
      );

      const result = workTypeEpisodeMappingStorage.delete("測試類型");
      expect(result).toBe(true);
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        "watchedit_work_type_episode_mapping",
        "[]"
      );
    });

    it("應該返回 false 當作品類型不存在", () => {
      const result = workTypeEpisodeMappingStorage.delete("不存在的類型");
      expect(result).toBe(false);
    });
  });

  describe("resetToDefault", () => {
    it("應該重置為預設對應關係", () => {
      workTypeEpisodeMappingStorage.resetToDefault();
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        "watchedit_work_type_episode_mapping",
        JSON.stringify(DEFAULT_WORK_TYPE_EPISODE_MAPPING)
      );
    });
  });

  describe("hasMapping", () => {
    it("應該返回 true 當作品類型有對應關係", () => {
      const existingMappings = [
        {
          workType: "測試類型",
          episodeTypes: ["episode"] as EpisodeType[],
          defaultEpisodeType: "episode" as EpisodeType,
        },
      ];
      mockLocalStorage.getItem.mockReturnValue(
        JSON.stringify(existingMappings)
      );

      const result = workTypeEpisodeMappingStorage.hasMapping("測試類型");
      expect(result).toBe(true);
    });

    it("應該返回 false 當作品類型沒有對應關係", () => {
      const result = workTypeEpisodeMappingStorage.hasMapping("不存在的類型");
      expect(result).toBe(false);
    });
  });

  describe("getWorkTypes", () => {
    it("應該返回所有作品類型名稱", () => {
      const existingMappings = [
        {
          workType: "動畫",
          episodeTypes: ["episode"] as EpisodeType[],
          defaultEpisodeType: "episode" as EpisodeType,
        },
        {
          workType: "電影",
          episodeTypes: ["movie"] as EpisodeType[],
          defaultEpisodeType: "movie" as EpisodeType,
        },
      ];
      mockLocalStorage.getItem.mockReturnValue(
        JSON.stringify(existingMappings)
      );

      const workTypes = workTypeEpisodeMappingStorage.getWorkTypes();
      expect(workTypes).toEqual(["動畫", "電影"]);
    });
  });

  describe("getByWorkType", () => {
    it("應該返回對應的作品類型映射", () => {
      const existingMappings = [
        {
          workType: "動畫",
          episodeTypes: ["episode", "special"] as EpisodeType[],
          defaultEpisodeType: "episode" as EpisodeType,
        },
      ];
      mockLocalStorage.getItem.mockReturnValue(
        JSON.stringify(existingMappings)
      );

      const mapping = workTypeEpisodeMappingStorage.getByWorkType("動畫");
      expect(mapping).toEqual(existingMappings[0]);
    });

    it("應該返回 null 當作品類型不存在", () => {
      const mapping =
        workTypeEpisodeMappingStorage.getByWorkType("不存在的類型");
      expect(mapping).toBeNull();
    });
  });
});
