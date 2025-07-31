// 作品類型管理
export interface WorkType {
  id: string;
  name: string;
  color: string;
  icon?: string;
  description?: string;
  isDefault: boolean;
  isEnabled: boolean;
  createdAt: string;
  updatedAt?: string;
}

// 預設作品類型
export const DEFAULT_WORK_TYPES: WorkType[] = [
  {
    id: "anime",
    name: "動畫",
    color: "#3B82F6",
    icon: "🎬",
    description: "日本動畫作品",
    isDefault: true,
    isEnabled: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "movie",
    name: "電影",
    color: "#EF4444",
    icon: "🎭",
    description: "電影作品",
    isDefault: true,
    isEnabled: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "tv",
    name: "電視劇",
    color: "#10B981",
    icon: "📺",
    description: "電視劇作品",
    isDefault: true,
    isEnabled: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "novel",
    name: "小說",
    color: "#8B5CF6",
    icon: "📚",
    description: "小說作品",
    isDefault: true,
    isEnabled: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "manga",
    name: "漫畫",
    color: "#F59E0B",
    icon: "📖",
    description: "漫畫作品",
    isDefault: true,
    isEnabled: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "game",
    name: "遊戲",
    color: "#EC4899",
    icon: "🎮",
    description: "遊戲作品",
    isDefault: true,
    isEnabled: false, // 預設禁用遊戲類型
    createdAt: new Date().toISOString(),
  },
];

// 本地存儲鍵名
const WORK_TYPES_STORAGE_KEY = "watchedit_work_types";

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

// 作品類型存儲管理
export const workTypeStorage = {
  // 取得所有作品類型
  getAll(): WorkType[] {
    try {
      if (typeof window === "undefined") {
        return DEFAULT_WORK_TYPES;
      }

      const data = localStorage.getItem(WORK_TYPES_STORAGE_KEY);
      if (data) {
        return JSON.parse(data);
      }
      // 如果沒有數據，初始化預設類型
      this.initializeDefaultTypes();
      return DEFAULT_WORK_TYPES;
    } catch (error) {
      console.error("讀取作品類型數據失敗:", error);
      return DEFAULT_WORK_TYPES;
    }
  },

  // 初始化預設類型
  initializeDefaultTypes(): void {
    if (typeof window === "undefined") {
      return;
    }
    localStorage.setItem(
      WORK_TYPES_STORAGE_KEY,
      JSON.stringify(DEFAULT_WORK_TYPES)
    );
  },

  // 取得啟用的作品類型
  getEnabled(): WorkType[] {
    return this.getAll().filter((type) => type.isEnabled);
  },

  // 新增作品類型
  create(typeData: Omit<WorkType, "id" | "createdAt" | "updatedAt">): WorkType {
    if (typeof window === "undefined") {
      throw new Error("無法在服務器端創建作品類型");
    }

    const types = this.getAll();
    const newType: WorkType = {
      id: generateId(),
      ...typeData,
      createdAt: getCurrentTimestamp(),
    };

    types.push(newType);
    localStorage.setItem(WORK_TYPES_STORAGE_KEY, JSON.stringify(types));
    return newType;
  },

  // 更新作品類型
  update(
    id: string,
    typeData: Partial<Omit<WorkType, "id" | "createdAt">>
  ): WorkType | null {
    if (typeof window === "undefined") {
      throw new Error("無法在服務器端更新作品類型");
    }

    const types = this.getAll();
    const index = types.findIndex((t) => t.id === id);

    if (index === -1) return null;

    types[index] = {
      ...types[index],
      ...typeData,
      updatedAt: getCurrentTimestamp(),
    };

    localStorage.setItem(WORK_TYPES_STORAGE_KEY, JSON.stringify(types));
    return types[index];
  },

  // 刪除作品類型
  delete(id: string): boolean {
    const types = this.getAll();
    const typeToDelete = types.find((t) => t.id === id);

    // 不允許刪除預設類型
    if (typeToDelete?.isDefault) {
      throw new Error("無法刪除預設作品類型");
    }

    const filteredTypes = types.filter((t) => t.id !== id);

    if (filteredTypes.length === types.length) return false;

    localStorage.setItem(WORK_TYPES_STORAGE_KEY, JSON.stringify(filteredTypes));
    return true;
  },

  // 啟用/禁用作品類型
  toggleEnabled(id: string): WorkType | null {
    const types = this.getAll();
    const type = types.find((t) => t.id === id);

    if (!type) return null;

    // 不允許禁用所有類型，至少保留一個
    if (!type.isEnabled && types.filter((t) => t.isEnabled).length === 0) {
      throw new Error("至少需要保留一個啟用的作品類型");
    }

    return this.update(id, { isEnabled: !type.isEnabled });
  },

  // 重置為預設類型
  resetToDefault(): void {
    localStorage.setItem(
      WORK_TYPES_STORAGE_KEY,
      JSON.stringify(DEFAULT_WORK_TYPES)
    );
  },

  // 檢查類型名稱是否重複
  isNameDuplicate(name: string, excludeId?: string): boolean {
    const types = this.getAll();
    return types.some((type) => type.name === name && type.id !== excludeId);
  },

  // 取得類型名稱列表（用於類型轉換）
  getTypeNames(): string[] {
    return this.getEnabled().map((type) => type.name);
  },

  // 根據名稱取得類型
  getByName(name: string): WorkType | null {
    return this.getAll().find((type) => type.name === name) || null;
  },
};
