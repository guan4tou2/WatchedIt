import {
  WorkTypeEpisodeMapping,
  DEFAULT_WORK_TYPE_EPISODE_MAPPING,
  EpisodeType,
} from "@/types";

// 本地存儲鍵名
const WORK_TYPE_EPISODE_MAPPING_STORAGE_KEY =
  "watchedit_work_type_episode_mapping";

// 作品類型與集數類型對應管理
export const workTypeEpisodeMappingStorage = {
  // 取得所有對應關係
  getAll(): WorkTypeEpisodeMapping[] {
    try {
      if (typeof window === "undefined") {
        return DEFAULT_WORK_TYPE_EPISODE_MAPPING;
      }

      const data = localStorage.getItem(WORK_TYPE_EPISODE_MAPPING_STORAGE_KEY);
      if (data) {
        return JSON.parse(data);
      }
      // 如果沒有數據，初始化預設對應關係
      this.initializeDefaultMapping();
      return DEFAULT_WORK_TYPE_EPISODE_MAPPING;
    } catch (error) {
      console.error("讀取作品類型與集數類型對應數據失敗:", error);
      return DEFAULT_WORK_TYPE_EPISODE_MAPPING;
    }
  },

  // 初始化預設對應關係
  initializeDefaultMapping(): void {
    if (typeof window === "undefined") {
      return;
    }
    localStorage.setItem(
      WORK_TYPE_EPISODE_MAPPING_STORAGE_KEY,
      JSON.stringify(DEFAULT_WORK_TYPE_EPISODE_MAPPING)
    );
  },

  // 根據作品類型取得對應的集數類型
  getEpisodeTypesForWorkType(workType: string): EpisodeType[] {
    const mappings = this.getAll();
    const mapping = mappings.find((m) => m.workType === workType);
    return mapping?.episodeTypes || ["episode"];
  },

  // 根據作品類型取得預設集數類型
  getDefaultEpisodeTypeForWorkType(workType: string): EpisodeType {
    const mappings = this.getAll();
    const mapping = mappings.find((m) => m.workType === workType);
    return mapping?.defaultEpisodeType || "episode";
  },

  // 新增對應關係
  create(mapping: Omit<WorkTypeEpisodeMapping, "id">): WorkTypeEpisodeMapping {
    if (typeof window === "undefined") {
      throw new Error("無法在服務器端創建對應關係");
    }

    const mappings = this.getAll();

    // 檢查是否已存在相同作品類型的對應關係
    const existingIndex = mappings.findIndex(
      (m) => m.workType === mapping.workType
    );
    if (existingIndex !== -1) {
      throw new Error(`作品類型「${mapping.workType}」的對應關係已存在`);
    }

    mappings.push(mapping);
    localStorage.setItem(
      WORK_TYPE_EPISODE_MAPPING_STORAGE_KEY,
      JSON.stringify(mappings)
    );
    return mapping;
  },

  // 更新對應關係
  update(
    workType: string,
    mappingData: Partial<Omit<WorkTypeEpisodeMapping, "workType">>
  ): WorkTypeEpisodeMapping | null {
    if (typeof window === "undefined") {
      throw new Error("無法在服務器端更新對應關係");
    }

    const mappings = this.getAll();
    const index = mappings.findIndex((m) => m.workType === workType);

    if (index === -1) return null;

    mappings[index] = {
      ...mappings[index],
      ...mappingData,
    };

    localStorage.setItem(
      WORK_TYPE_EPISODE_MAPPING_STORAGE_KEY,
      JSON.stringify(mappings)
    );
    return mappings[index];
  },

  // 刪除對應關係
  delete(workType: string): boolean {
    const mappings = this.getAll();
    const filteredMappings = mappings.filter((m) => m.workType !== workType);

    if (filteredMappings.length === mappings.length) return false;

    localStorage.setItem(
      WORK_TYPE_EPISODE_MAPPING_STORAGE_KEY,
      JSON.stringify(filteredMappings)
    );
    return true;
  },

  // 重置為預設對應關係
  resetToDefault(): void {
    localStorage.setItem(
      WORK_TYPE_EPISODE_MAPPING_STORAGE_KEY,
      JSON.stringify(DEFAULT_WORK_TYPE_EPISODE_MAPPING)
    );
  },

  // 檢查作品類型是否已有對應關係
  hasMapping(workType: string): boolean {
    const mappings = this.getAll();
    return mappings.some((m) => m.workType === workType);
  },

  // 取得所有作品類型名稱
  getWorkTypes(): string[] {
    const mappings = this.getAll();
    return mappings.map((m) => m.workType);
  },

  // 根據作品類型取得對應關係
  getByWorkType(workType: string): WorkTypeEpisodeMapping | null {
    const mappings = this.getAll();
    return mappings.find((m) => m.workType === workType) || null;
  },
};
