// 提醒頻率類型
export type ReminderFrequency = "daily" | "weekly" | "monthly" | "custom";

// 作品類型
export interface Work {
  id: string;
  title: string;
  type: string; // 改為動態類型
  status: "進行中" | "已完結" | "暫停" | "放棄" | "未播出" | "已取消";
  year?: number;
  episodes: Episode[];
  rating?: number;
  review?: string;
  note?: string;
  source?: string;
  reminder_enabled: boolean;
  reminder_frequency?: ReminderFrequency;
  tags: Tag[];
  date_added: string;
  date_updated?: string;
}

// 集數類型 - 改為字串以支援自訂類型
export type EpisodeType = string;

// 自訂集數類型
export interface CustomEpisodeType {
  id: string;
  name: string;
  label: string;
  color: string;
  icon: string;
  isDefault: boolean;
  isEnabled: boolean;
  createdAt: string;
  updatedAt?: string;
}

// 預設的集數類型
export const DEFAULT_EPISODE_TYPES: CustomEpisodeType[] = [
  {
    id: "episode",
    name: "episode",
    label: "正篇",
    color: "#3B82F6",
    icon: "📺",
    isDefault: true,
    isEnabled: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "special",
    name: "special",
    label: "特別篇",
    color: "#10B981",
    icon: "🎬",
    isDefault: true,
    isEnabled: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "ova",
    name: "ova",
    label: "OVA",
    color: "#F59E0B",
    icon: "🎭",
    isDefault: true,
    isEnabled: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "movie",
    name: "movie",
    label: "電影",
    color: "#EF4444",
    icon: "🎞️",
    isDefault: true,
    isEnabled: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "chapter",
    name: "chapter",
    label: "章節",
    color: "#8B5CF6",
    icon: "📖",
    isDefault: true,
    isEnabled: true,
    createdAt: new Date().toISOString(),
  },
];

// 集數
export interface Episode {
  id: string;
  number: number; // 集數
  title?: string; // 標題
  description?: string; // 描述
  type: EpisodeType; // 類型
  season: number; // 季數
  watched: boolean; // 是否已觀看
  date_watched?: string; // 觀看日期
  note?: string; // 備註
}

// 作品類型與集數類型對應
export interface WorkTypeEpisodeMapping {
  workType: string;
  episodeTypes: EpisodeType[];
  defaultEpisodeType: EpisodeType;
}

// 預設的作品類型與集數類型對應
export const DEFAULT_WORK_TYPE_EPISODE_MAPPING: WorkTypeEpisodeMapping[] = [
  {
    workType: "動畫",
    episodeTypes: ["episode", "special", "ova", "movie"],
    defaultEpisodeType: "episode",
  },
  {
    workType: "電影",
    episodeTypes: ["movie"],
    defaultEpisodeType: "movie",
  },
  {
    workType: "電視劇",
    episodeTypes: ["episode", "special"],
    defaultEpisodeType: "episode",
  },
  {
    workType: "小說",
    episodeTypes: ["chapter"],
    defaultEpisodeType: "chapter",
  },
  {
    workType: "漫畫",
    episodeTypes: ["chapter"],
    defaultEpisodeType: "chapter",
  },
  {
    workType: "遊戲",
    episodeTypes: ["episode", "special"],
    defaultEpisodeType: "episode",
  },
];

// 作品建立
export interface WorkCreate {
  title: string;
  type: string; // 改為動態類型
  status: Work["status"];
  year?: number;
  episodes?: Episode[];
  rating?: number;
  review?: string;
  note?: string;
  source?: string;
  reminder_enabled?: boolean;
  reminder_frequency?: ReminderFrequency;
  tag_ids?: number[];
  tags?: Tag[];
}

// 作品更新
export interface WorkUpdate {
  title?: string;
  type?: string; // 改為動態類型
  status?: Work["status"];
  year?: number;
  episodes?: Episode[];
  rating?: number;
  review?: string;
  note?: string;
  source?: string;
  reminder_enabled?: boolean;
  reminder_frequency?: ReminderFrequency;
  tag_ids?: number[];
  tags?: Tag[];
}

// 作品列表
export interface WorkList {
  works: Work[];
  total: number;
  page: number;
  size: number;
}

// 標籤
export interface Tag {
  id: number;
  name: string;
  color: string;
}

// 統計數據
export interface Stats {
  total_works: number;
  type_stats: Record<string, number>;
  status_stats: Record<string, number>;
  year_stats: Record<string, number>;
  episode_stats: {
    total_episodes: number;
    watched_episodes: number;
    completion_rate: number;
  };
}

// 動畫搜尋結果
export interface AnimeSearchResult {
  id: number;
  title: {
    romaji: string;
    english: string;
    native: string;
  };
  type: string;
  episodes?: number;
  status: string;
  season?: string;
  year?: number;
  coverImage: {
    large: string;
    medium: string;
  };
  description?: string;
}
