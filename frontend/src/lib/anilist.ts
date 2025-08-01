import * as OpenCC from "opencc-js";

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
  private graphqlUrl: string = "https://graphql.anilist.co";

  private constructor() {
    // 直接使用 AniList GraphQL API
  }

  static getInstance(): AniListService {
    if (!AniListService.instance) {
      AniListService.instance = new AniListService();
    }
    return AniListService.instance;
  }

  private async query<T>(graphqlQuery: string, variables?: any): Promise<T> {
    try {
      const response = await fetch(this.graphqlUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          query: graphqlQuery,
          variables: variables,
        }),
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
    const graphqlQuery = `
      query ($search: String, $page: Int, $perPage: Int) {
        Page (page: $page, perPage: $perPage) {
          media (search: $search, type: ANIME) {
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
            season
            seasonYear
            status
            description
            coverImage {
              large
              medium
            }
            bannerImage
            genres
            averageScore
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

    const response = await this.query<AniListSearchResponse>(graphqlQuery, {
      search: searchTerm,
      page: page,
      perPage: perPage,
    });

    return response.data.Page.media;
  }

  async getAnimeById(id: number): Promise<AniListMedia> {
    const graphqlQuery = `
      query ($id: Int) {
        Media (id: $id, type: ANIME) {
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
          season
          seasonYear
          status
          description
          coverImage {
            large
            medium
          }
          bannerImage
          genres
          averageScore
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

    const response = await this.query<AniListMediaResponse>(graphqlQuery, {
      id: id,
    });

    return response.data.Media;
  }

  // 將 AniList 狀態轉換為我們的狀態
  convertStatus(
    aniListStatus: string
  ): "進行中" | "已完結" | "暫停" | "放棄" | "未播出" | "已取消" {
    switch (aniListStatus) {
      case "FINISHED":
        return "已完結";
      case "RELEASING":
        return "進行中";
      case "NOT_YET_RELEASED":
        return "未播出";
      case "CANCELLED":
        return "已取消";
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
    if (!aniListScore) return 0;
    // AniList 評分是 0-100，我們需要轉換為 1-5
    return aniListScore / 10;
  }

  // 清理描述文字
  cleanDescription(description: string | null): string | undefined {
    if (!description) return "";
    // 移除 HTML 標籤
    return description.replace(/<[^>]*>/g, "").trim();
  }

  // 獲取主要年份
  getYear(startDate: { year: number | null }): number | undefined {
    return startDate.year || 0;
  }

  // 簡體轉繁體中文
  // 使用 OpenCC (Open Chinese Convert) 進行高質量的簡體轉繁體轉換
  // 支援詞彙級別的轉換，比簡單的字符替換更準確
  private convertToTraditional(text: string): string {
    // 使用 OpenCC 進行簡體轉繁體轉換
    const converter = OpenCC.Converter({ from: "cn", to: "tw" });
    return converter(text);
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

    // 如果沒有中文標題，優先使用英文標題
    return title.english || title.romaji || title.native;
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
