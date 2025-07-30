import {
  Work,
  WorkCreate,
  WorkUpdate,
  WorkList,
  Tag,
  Stats,
  EpisodeProgress,
} from "@/types";

// 本地儲存鍵名
const STORAGE_KEYS = {
  WORKS: "watchedit_works",
  TAGS: "watchedit_tags",
} as const;

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

// 作品相關操作
export const workStorage = {
  // 取得所有作品
  getAll(): Work[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.WORKS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error("讀取作品數據失敗:", error);
      return [];
    }
  },

  // 新增作品
  create(workData: WorkCreate): Work {
    const works = this.getAll();
    const newWork: Work = {
      id: generateId(),
      ...workData,
      date_added: getCurrentTimestamp(),
      date_updated: null,
      tags: [],
      progress: workData.progress || {
        current: 0,
        total: undefined,
        special: 0,
        season: 1,
      },
    };

    works.push(newWork);
    localStorage.setItem(STORAGE_KEYS.WORKS, JSON.stringify(works));
    return newWork;
  },

  // 更新作品
  update(id: string, workData: WorkUpdate): Work | null {
    const works = this.getAll();
    const index = works.findIndex((w) => w.id === id);

    if (index === -1) return null;

    works[index] = {
      ...works[index],
      ...workData,
      date_updated: getCurrentTimestamp(),
    };

    localStorage.setItem(STORAGE_KEYS.WORKS, JSON.stringify(works));
    return works[index];
  },

  // 刪除作品
  delete(id: string): boolean {
    const works = this.getAll();
    const filteredWorks = works.filter((w) => w.id !== id);

    if (filteredWorks.length === works.length) return false;

    localStorage.setItem(STORAGE_KEYS.WORKS, JSON.stringify(filteredWorks));
    return true;
  },

  // 取得作品列表（支援分頁和篩選）
  getList(params?: {
    page?: number;
    size?: number;
    title?: string;
    type?: string;
    status?: string;
    year?: number;
    tag_ids?: number[];
  }): WorkList {
    let works = this.getAll();

    // 篩選
    if (params?.title) {
      works = works.filter((w) =>
        w.title.toLowerCase().includes(params.title!.toLowerCase())
      );
    }

    if (params?.type) {
      works = works.filter((w) => w.type === params.type);
    }

    if (params?.status) {
      works = works.filter((w) => w.status === params.status);
    }

    if (params?.year) {
      works = works.filter((w) => w.year === params.year);
    }

    if (params?.tag_ids && params.tag_ids.length > 0) {
      works = works.filter((w) =>
        w.tags.some((tag) => params.tag_ids!.includes(tag.id))
      );
    }

    // 分頁
    const page = params?.page || 1;
    const size = params?.size || 20;
    const start = (page - 1) * size;
    const end = start + size;

    return {
      works: works.slice(start, end),
      total: works.length,
      page,
      size,
    };
  },

  // 取得統計數據
  getStats(): Stats {
    const works = this.getAll();

    // 按類型統計
    const typeStats: Record<string, number> = {};
    works.forEach((work) => {
      typeStats[work.type] = (typeStats[work.type] || 0) + 1;
    });

    // 按狀態統計
    const statusStats: Record<string, number> = {};
    works.forEach((work) => {
      statusStats[work.status] = (statusStats[work.status] || 0) + 1;
    });

    // 按年份統計
    const yearStats: Record<string, number> = {};
    works.forEach((work) => {
      const year = work.year?.toString() || "未知";
      yearStats[year] = (yearStats[year] || 0) + 1;
    });

    // 進度統計
    let totalEpisodes = 0;
    let watchedEpisodes = 0;

    works.forEach((work) => {
      if (work.progress) {
        totalEpisodes += work.progress.total || 0;
        watchedEpisodes += work.progress.current || 0;
      }
    });

    const completionRate =
      totalEpisodes > 0
        ? Math.round((watchedEpisodes / totalEpisodes) * 100)
        : 0;

    return {
      total_works: works.length,
      type_stats: typeStats,
      status_stats: statusStats,
      year_stats: yearStats,
      progress_stats: {
        total_episodes: totalEpisodes,
        watched_episodes: watchedEpisodes,
        completion_rate: completionRate,
      },
    };
  },
};

// 標籤相關操作
export const tagStorage = {
  // 取得所有標籤
  getAll(): Tag[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TAGS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error("讀取標籤數據失敗:", error);
      return [];
    }
  },

  // 新增標籤
  create(tagData: { name: string; color: string }): Tag {
    const tags = this.getAll();
    const newTag: Tag = {
      id: Math.max(0, ...tags.map((t) => t.id)) + 1,
      ...tagData,
    };

    tags.push(newTag);
    localStorage.setItem(STORAGE_KEYS.TAGS, JSON.stringify(tags));
    return newTag;
  },

  // 更新標籤
  update(id: number, tagData: { name?: string; color?: string }): Tag | null {
    const tags = this.getAll();
    const index = tags.findIndex((t) => t.id === id);

    if (index === -1) return null;

    tags[index] = { ...tags[index], ...tagData };
    localStorage.setItem(STORAGE_KEYS.TAGS, JSON.stringify(tags));
    return tags[index];
  },

  // 刪除標籤
  delete(id: number): boolean {
    const tags = this.getAll();
    const filteredTags = tags.filter((t) => t.id !== id);

    if (filteredTags.length === tags.length) return false;

    localStorage.setItem(STORAGE_KEYS.TAGS, JSON.stringify(filteredTags));
    return true;
  },
};

// 初始化示例數據
export const initializeSampleData = () => {
  const works = workStorage.getAll();
  const tags = tagStorage.getAll();

  if (works.length === 0) {
    // 新增示例作品
    workStorage.create({
      title: "進擊的巨人",
      type: "動畫",
      status: "已完成",
      year: 2013,
      rating: 5,
      review: "經典神作！",
      source: "AniList",
      progress: {
        current: 25,
        total: 25,
        special: 2,
        season: 1,
        episode_type: "episode",
      },
    });

    workStorage.create({
      title: "鬼滅之刃",
      type: "動畫",
      status: "進行中",
      year: 2019,
      rating: 4,
      source: "AniList",
      progress: {
        current: 8,
        total: 26,
        special: 0,
        season: 1,
        episode_type: "episode",
      },
    });

    workStorage.create({
      title: "哈利波特與魔法石",
      type: "小說",
      status: "已完成",
      year: 1997,
      rating: 5,
      review: "魔法世界的開始",
      source: "手動新增",
      progress: {
        current: 17,
        total: 17,
        special: 0,
        season: 1,
        episode_type: "chapter",
      },
    });
  }

  if (tags.length === 0) {
    // 新增示例標籤
    tagStorage.create({ name: "神作", color: "#FF6B6B" });
    tagStorage.create({ name: "熱血", color: "#4ECDC4" });
    tagStorage.create({ name: "劇情", color: "#45B7D1" });
    tagStorage.create({ name: "魔法", color: "#96CEB4" });
    tagStorage.create({ name: "冒險", color: "#FFEAA7" });
  }
};
