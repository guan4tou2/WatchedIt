interface AniListMedia {
  id: number;
  title: {
    romaji: string;
    english: string;
    native: string;
  };
  type: "ANIME" | "MANGA";
  format: string;
  episodes: number | null;
  duration: number | null;
  status:
    | "FINISHED"
    | "RELEASING"
    | "NOT_YET_RELEASED"
    | "CANCELLED"
    | "HIATUS";
  season: "WINTER" | "SPRING" | "SUMMER" | "FALL" | null;
  seasonYear: number | null;
  description: string | null;
  genres: string[];
  averageScore: number | null;
  coverImage: {
    large: string;
    medium: string;
  } | null;
  bannerImage: string | null;
  startDate: {
    year: number | null;
    month: number | null;
    day: number | null;
  };
  endDate: {
    year: number | null;
    month: number | null;
    day: number | null;
  };
  synonyms?: string[];
  countryOfOrigin?: string;
}

interface AniListSearchResponse {
  data: {
    Page: {
      media: AniListMedia[];
    };
  };
}

interface AniListMediaResponse {
  data: {
    Media: AniListMedia;
  };
}

class AniListService {
  private static instance: AniListService;
  private baseUrl = "/api/search";

  private constructor() {}

  static getInstance(): AniListService {
    if (!AniListService.instance) {
      AniListService.instance = new AniListService();
    }
    return AniListService.instance;
  }

  private async query<T>(query: string, variables?: any): Promise<T> {
    try {
      // 構建查詢參數
      const params = new URLSearchParams();
      if (variables.search) params.append("q", variables.search);
      if (variables.page) params.append("page", variables.page.toString());
      if (variables.perPage)
        params.append("perPage", variables.perPage.toString());

      const response = await fetch(`${this.baseUrl}?${params.toString()}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.errors) {
        throw new Error(data.errors[0]?.message || "AniList API error");
      }

      return data;
    } catch (error) {
      console.error("AniList API error:", error);
      throw error;
    }
  }

  async searchAnime(
    searchTerm: string,
    page: number = 1,
    perPage: number = 10
  ): Promise<AniListMedia[]> {
    const query = `
      query ($search: String, $page: Int, $perPage: Int) {
        Page(page: $page, perPage: $perPage) {
          media(search: $search, type: ANIME, sort: [POPULARITY_DESC, SCORE_DESC]) {
            id
            title {
              romaji
              english
              native
            }
            type
            format
            episodes
            duration
            status
            season
            seasonYear
            description
            genres
            averageScore
            coverImage {
              large
              medium
            }
            bannerImage
            startDate {
              year
              month
              day
            }
            endDate {
              year
              month
              day
            }
            synonyms
            countryOfOrigin
          }
        }
      }
    `;

    const response = await this.query<AniListSearchResponse>(query, {
      search: searchTerm,
      page,
      perPage,
    });

    return response.data.Page.media;
  }

  async getAnimeById(id: number): Promise<AniListMedia> {
    const query = `
      query ($id: Int) {
        Media(id: $id, type: ANIME) {
          id
          title {
            romaji
            english
            native
          }
          type
          format
          episodes
          duration
          status
          season
          seasonYear
          description
          genres
          averageScore
          coverImage {
            large
            medium
          }
          bannerImage
          startDate {
            year
            month
            day
          }
          endDate {
            year
            month
            day
          }
          synonyms
          countryOfOrigin
        }
      }
    `;

    const response = await this.query<AniListMediaResponse>(query, { id });
    return response.data.Media;
  }

  // 將 AniList 狀態轉換為我們的狀態
  convertStatus(aniListStatus: string): "進行中" | "已完結" | "暫停" | "放棄" {
    switch (aniListStatus) {
      case "FINISHED":
        return "已完結";
      case "RELEASING":
        return "進行中";
      case "NOT_YET_RELEASED":
        return "進行中";
      case "CANCELLED":
        return "放棄";
      case "HIATUS":
        return "暫停";
      default:
        return "進行中";
    }
  }

  // 將 AniList 格式轉換為中文
  convertFormat(format: string): string {
    switch (format) {
      case "TV":
        return "電視動畫";
      case "TV_SHORT":
        return "電視動畫短篇";
      case "MOVIE":
        return "電影";
      case "SPECIAL":
        return "特別篇";
      case "OVA":
        return "OVA";
      case "ONA":
        return "網路動畫";
      case "MUSIC":
        return "音樂動畫";
      case "MANGA":
        return "漫畫";
      case "NOVEL":
        return "小說";
      case "ONE_SHOT":
        return "單篇";
      default:
        return format;
    }
  }

  // 將 AniList 季節轉換為中文
  convertSeason(season: string | null): string {
    if (!season) return "";

    switch (season) {
      case "WINTER":
        return "冬季";
      case "SPRING":
        return "春季";
      case "SUMMER":
        return "夏季";
      case "FALL":
        return "秋季";
      default:
        return season;
    }
  }

  // 將 AniList 類型轉換為中文
  convertType(type: string): string {
    switch (type) {
      case "ANIME":
        return "動畫";
      case "MANGA":
        return "漫畫";
      default:
        return type;
    }
  }

  // 將 AniList 類型轉換為我們的類型
  convertTypeToWorkType(type: string): string {
    switch (type) {
      case "ANIME":
        return "動畫";
      case "MANGA":
        return "漫畫";
      default:
        return "動畫";
    }
  }

  // 將 AniList 評分轉換為我們的評分
  convertRating(aniListScore: number | null): number | undefined {
    if (!aniListScore) return undefined;
    // AniList 評分是 0-100，我們需要轉換為 1-5
    return Math.round(aniListScore / 20);
  }

  // 清理描述文字
  cleanDescription(description: string | null): string | undefined {
    if (!description) return undefined;
    // 移除 HTML 標籤
    return description.replace(/<[^>]*>/g, "").trim();
  }

  // 獲取主要年份
  getYear(startDate: { year: number | null }): number | undefined {
    return startDate.year || undefined;
  }

  // 簡體轉繁體中文
  private convertToTraditional(text: string): string {
    // 使用更通用的簡體轉繁體轉換
    return text
      .replace(/进/g, "進")
      .replace(/击/g, "擊")
      .replace(/灭/g, "滅")
      .replace(/贼/g, "賊")
      .replace(/龙/g, "龍")
      .replace(/记/g, "記")
      .replace(/学院/g, "學院")
      .replace(/术/g, "術")
      .replace(/回/g, "迴")
      .replace(/战/g, "戰")
      .replace(/谍/g, "諜")
      .replace(/锯/g, "鋸")
      .replace(/种/g, "種")
      .replace(/命运/g, "命運")
      .replace(/门/g, "門")
      .replace(/鲁/g, "魯")
      .replace(/世纪/g, "世紀")
      .replace(/战士/g, "戰士")
      .replace(/壳/g, "殼")
      .replace(/机动/g, "機動")
      .replace(/队/g, "隊")
      .replace(/隐/g, "隱")
      .replace(/猫/g, "貓")
      .replace(/霍尔/g, "霍爾")
      .replace(/移动/g, "移動")
      .replace(/猪/g, "豬")
      .replace(/辉/g, "輝")
      .replace(/耀/g, "耀")
      .replace(/回忆/g, "回憶")
      .replace(/玛/g, "瑪")
      .replace(/妮/g, "妮")
      .replace(/缇/g, "緹")
      .replace(/来自/g, "來自")
      .replace(/红花/g, "紅花")
      .replace(/报恩/g, "報恩")
      .replace(/儿时/g, "兒時")
      .replace(/点点滴滴/g, "點點滴滴")
      .replace(/萤火虫/g, "螢火蟲")
      .replace(/合战/g, "合戰")
      .replace(/邻居/g, "鄰居")
      .replace(/战记/g, "戰記")
      .replace(/龟/g, "龜")
      .replace(/魔女/g, "魔女")
      .replace(/怎样/g, "怎樣");
  }

  // 獲取最佳中文標題
  getBestChineseTitle(
    title: {
      romaji: string;
      english: string;
      native: string;
    },
    synonyms?: string[]
  ): string {
    // 優先從 synonyms 中尋找中文標題
    if (synonyms) {
      const chineseTitle = synonyms.find(
        (synonym) => /[\u4e00-\u9fff]/.test(synonym) && synonym.length > 0
      );
      if (chineseTitle) {
        return this.convertToTraditional(chineseTitle);
      }
    }

    // 如果沒有中文標題，使用羅馬字
    return title.romaji || title.english || title.native;
  }

  // 獲取所有可用的標題
  getAllTitles(
    title: {
      romaji: string;
      english: string;
      native: string;
    },
    synonyms?: string[]
  ): string[] {
    const titles: string[] = [];

    // 優先添加中文標題（包括 synonyms 和映射的）
    const bestChineseTitle = this.getBestChineseTitle(title, synonyms);
    if (bestChineseTitle && !titles.includes(bestChineseTitle)) {
      titles.push(bestChineseTitle);
    }

    // 添加其他中文 synonyms
    if (synonyms) {
      synonyms.forEach((synonym) => {
        if (
          /[\u4e00-\u9fff]/.test(synonym) &&
          synonym.length > 0 &&
          !titles.includes(synonym)
        ) {
          titles.push(synonym);
        }
      });
    }

    // 添加其他標題
    if (title.romaji && !titles.includes(title.romaji))
      titles.push(title.romaji);
    if (
      title.english &&
      title.english !== title.romaji &&
      !titles.includes(title.english)
    )
      titles.push(title.english);
    if (
      title.native &&
      title.native !== title.romaji &&
      !titles.includes(title.native)
    )
      titles.push(title.native);

    return titles;
  }
}

export const anilistService = AniListService.getInstance();
export type { AniListMedia };
