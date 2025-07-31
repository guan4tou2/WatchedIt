import { CustomEpisodeType, DEFAULT_EPISODE_TYPES } from "@/types";

// 本地存儲鍵名
const CUSTOM_EPISODE_TYPES_STORAGE_KEY = "watchedit_custom_episode_types";

// 自訂集數類型管理
export const customEpisodeTypeStorage = {
  // 取得所有集數類型
  getAll(): CustomEpisodeType[] {
    try {
      if (typeof window === "undefined") {
        return DEFAULT_EPISODE_TYPES;
      }

      const data = localStorage.getItem(CUSTOM_EPISODE_TYPES_STORAGE_KEY);
      if (data) {
        return JSON.parse(data);
      }
      // 如果沒有數據，初始化預設類型
      this.initializeDefaultTypes();
      return DEFAULT_EPISODE_TYPES;
    } catch (error) {
      console.error("讀取自訂集數類型數據失敗:", error);
      return DEFAULT_EPISODE_TYPES;
    }
  },

  // 初始化預設類型
  initializeDefaultTypes(): void {
    if (typeof window === "undefined") {
      return;
    }
    localStorage.setItem(
      CUSTOM_EPISODE_TYPES_STORAGE_KEY,
      JSON.stringify(DEFAULT_EPISODE_TYPES)
    );
  },

  // 取得啟用的集數類型
  getEnabledTypes(): CustomEpisodeType[] {
    return this.getAll().filter((type) => type.isEnabled);
  },

  // 根據ID取得集數類型
  getById(id: string): CustomEpisodeType | null {
    const types = this.getAll();
    return types.find((type) => type.id === id) || null;
  },

  // 根據名稱取得集數類型
  getByName(name: string): CustomEpisodeType | null {
    const types = this.getAll();
    return types.find((type) => type.name === name) || null;
  },

  // 新增集數類型
  create(
    typeData: Omit<CustomEpisodeType, "id" | "createdAt">
  ): CustomEpisodeType {
    if (typeof window === "undefined") {
      throw new Error("無法在服務器端創建集數類型");
    }

    const types = this.getAll();

    // 檢查名稱是否重複
    if (types.some((t) => t.name === typeData.name)) {
      throw new Error(`集數類型「${typeData.name}」已存在`);
    }

    const newType: CustomEpisodeType = {
      ...typeData,
      id: `custom_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    types.push(newType);
    localStorage.setItem(
      CUSTOM_EPISODE_TYPES_STORAGE_KEY,
      JSON.stringify(types)
    );
    return newType;
  },

  // 更新集數類型
  update(
    id: string,
    updateData: Partial<Omit<CustomEpisodeType, "id" | "createdAt">>
  ): CustomEpisodeType | null {
    if (typeof window === "undefined") {
      throw new Error("無法在服務器端更新集數類型");
    }

    const types = this.getAll();
    const index = types.findIndex((t) => t.id === id);

    if (index === -1) return null;

    // 檢查名稱是否重複（排除自己）
    if (
      updateData.name &&
      types.some((t, i) => i !== index && t.name === updateData.name)
    ) {
      throw new Error(`集數類型「${updateData.name}」已存在`);
    }

    types[index] = {
      ...types[index],
      ...updateData,
      updatedAt: new Date().toISOString(),
    };

    localStorage.setItem(
      CUSTOM_EPISODE_TYPES_STORAGE_KEY,
      JSON.stringify(types)
    );
    return types[index];
  },

  // 刪除集數類型
  delete(id: string): boolean {
    if (typeof window === "undefined") {
      throw new Error("無法在服務器端刪除集數類型");
    }

    const types = this.getAll();
    const type = types.find((t) => t.id === id);

    if (!type) return false;

    // 不允許刪除預設類型
    if (type.isDefault) {
      throw new Error("無法刪除預設的集數類型");
    }

    const filteredTypes = types.filter((t) => t.id !== id);
    localStorage.setItem(
      CUSTOM_EPISODE_TYPES_STORAGE_KEY,
      JSON.stringify(filteredTypes)
    );
    return true;
  },

  // 切換啟用狀態
  toggleEnabled(id: string): CustomEpisodeType | null {
    const type = this.getById(id);
    if (!type) return null;

    return this.update(id, { isEnabled: !type.isEnabled });
  },

  // 重置為預設
  resetToDefault(): void {
    if (typeof window === "undefined") {
      return;
    }
    this.initializeDefaultTypes();
  },

  // 檢查名稱是否重複
  isNameDuplicate(name: string, excludeId?: string): boolean {
    const types = this.getAll();
    return types.some((t) => t.name === name && t.id !== excludeId);
  },

  // 取得所有類型名稱
  getTypeNames(): string[] {
    return this.getEnabledTypes().map((type) => type.name);
  },

  // 取得類型標籤
  getTypeLabels(): Record<string, string> {
    const labels: Record<string, string> = {};
    this.getEnabledTypes().forEach((type) => {
      labels[type.name] = type.label;
    });
    return labels;
  },
};
