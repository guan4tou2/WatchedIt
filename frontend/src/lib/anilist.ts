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
  private baseUrl = "https://graphql.anilist.co";

  private constructor() {}

  static getInstance(): AniListService {
    if (!AniListService.instance) {
      AniListService.instance = new AniListService();
    }
    return AniListService.instance;
  }

  private async query<T>(query: string, variables?: any): Promise<T> {
    try {
      const response = await fetch(this.baseUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          query,
          variables,
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
        }
      }
    `;

    const response = await this.query<AniListMediaResponse>(query, { id });
    return response.data.Media;
  }

  // 將 AniList 狀態轉換為我們的狀態
  convertStatus(aniListStatus: string): "進行中" | "已完成" | "暫停" | "放棄" {
    switch (aniListStatus) {
      case "FINISHED":
        return "已完成";
      case "RELEASING":
        return "進行中";
      case "NOT_YET_RELEASED":
        return "暫停";
      case "CANCELLED":
      case "HIATUS":
        return "放棄";
      default:
        return "進行中";
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
}

export const anilistService = AniListService.getInstance();
export type { AniListMedia };
