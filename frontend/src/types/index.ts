// 作品類型
export interface Work {
  id: string;
  title: string;
  type: "動畫" | "電影" | "電視劇" | "小說" | "漫畫" | "遊戲";
  status: "進行中" | "已完成" | "暫停" | "放棄";
  year?: number;
  progress?: EpisodeProgress;
  rating?: number;
  review?: string;
  note?: string;
  source?: string;
  reminder_enabled: boolean;
  reminder_frequency?: string;
  tags: Tag[];
  date_added: string;
  date_updated?: string;
}

// 集數進度
export interface EpisodeProgress {
  current: number;
  total?: number;
  special?: number; // 特別篇/OVA/電影版等
  season?: number; // 季數
  episode_type?: "episode" | "chapter" | "volume" | "movie";
}

// 作品建立
export interface WorkCreate {
  title: string;
  type: Work["type"];
  status: Work["status"];
  year?: number;
  progress?: EpisodeProgress;
  rating?: number;
  review?: string;
  note?: string;
  source?: string;
  reminder_enabled?: boolean;
  reminder_frequency?: string;
  tag_ids?: number[];
}

// 作品更新
export interface WorkUpdate {
  title?: string;
  type?: Work["type"];
  status?: Work["status"];
  year?: number;
  progress?: EpisodeProgress;
  rating?: number;
  review?: string;
  note?: string;
  source?: string;
  reminder_enabled?: boolean;
  reminder_frequency?: string;
  tag_ids?: number[];
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
  progress_stats: {
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
