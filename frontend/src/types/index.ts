export interface Work {
  id: string;
  title: string;
  type: string;
  status: string;
  year?: number;
  progress?: any;
  date_added: string;
  date_updated?: string;
  rating?: number;
  review?: string;
  note?: string;
  source?: string;
  reminder_enabled: boolean;
  reminder_frequency?: string;
  tags: Tag[];
}

export interface Tag {
  id: number;
  name: string;
  color: string;
}

export interface WorkCreate {
  title: string;
  type: string;
  status: string;
  year?: number;
  progress?: any;
  rating?: number;
  review?: string;
  note?: string;
  source?: string;
  reminder_enabled: boolean;
  reminder_frequency?: string;
  tag_ids?: number[];
}

export interface WorkUpdate {
  title?: string;
  type?: string;
  status?: string;
  year?: number;
  progress?: any;
  rating?: number;
  review?: string;
  note?: string;
  source?: string;
  reminder_enabled?: boolean;
  reminder_frequency?: string;
  tag_ids?: number[];
}

export interface WorkList {
  works: Work[];
  total: number;
  page: number;
  size: number;
}

export interface AnimeSearchResult {
  id: number;
  title: string;
  type: string;
  year?: number;
  episodes?: number;
  status?: string;
  description?: string;
  cover_image?: string;
  genres?: string[];
  rating?: number;
  source: string;
}

export interface Stats {
  total_works: number;
  type_stats: Record<string, number>;
  status_stats: Record<string, number>;
  year_stats: Record<string, number>;
}
