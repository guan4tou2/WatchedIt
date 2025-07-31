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
  convertTypeToWorkType(
    type: string
  ): "動畫" | "電影" | "電視劇" | "小說" | "漫畫" | "遊戲" {
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

  // 中文標題映射表
  private chineseTitleMap: Record<string, string> = {
    "Cowboy Bebop": "星際牛仔",
    "Attack on Titan": "進擊的巨人",
    "Demon Slayer": "鬼滅之刃",
    "One Piece": "海賊王",
    Naruto: "火影忍者",
    "Dragon Ball": "七龍珠",
    "Death Note": "死亡筆記本",
    "Fullmetal Alchemist": "鋼之鍊金術師",
    "Hunter x Hunter": "獵人",
    "My Hero Academia": "我的英雄學院",
    "Jujutsu Kaisen": "咒術迴戰",
    "Spy x Family": "間諜家家酒",
    "Chainsaw Man": "鏈鋸人",
    "Demon Slayer: Kimetsu no Yaiba": "鬼滅之刃",
    "One Punch Man": "一拳超人",
    "Tokyo Ghoul": "東京喰種",
    "Steins;Gate": "命運石之門",
    "Code Geass": "反叛的魯路修",
    "Neon Genesis Evangelion": "新世紀福音戰士",
    "Ghost in the Shell": "攻殼機動隊",
    Akira: "阿基拉",
    "Spirited Away": "神隱少女",
    "My Neighbor Totoro": "龍貓",
    "Princess Mononoke": "魔法公主",
    "Howl's Moving Castle": "霍爾的移動城堡",
    "Castle in the Sky": "天空之城",
    "Nausicaä of the Valley of the Wind": "風之谷",
    "Kiki's Delivery Service": "魔女宅急便",
    "Porco Rosso": "紅豬",
    "The Wind Rises": "風起",
    Ponyo: "崖上的波妞",
    "The Tale of the Princess Kaguya": "輝耀姬物語",
    "When Marnie Was There": "回憶中的瑪妮",
    "The Secret World of Arrietty": "借物少女艾莉緹",
    "From Up on Poppy Hill": "來自紅花坂",
    "The Cat Returns": "貓的報恩",
    "Whisper of the Heart": "心之谷",
    "Only Yesterday": "兒時的點點滴滴",
    "Grave of the Fireflies": "螢火蟲之墓",
    "Pom Poko": "平成狸合戰",
    "My Neighbors the Yamadas": "我的鄰居山田君",
    "Tales from Earthsea": "地海戰記",
    "The Borrower Arrietty": "借物少女艾莉緹",
    "The Red Turtle": "紅龜",
    "Earwig and the Witch": "安雅與魔女",
    "How Do You Live?": "你想活出怎樣的人生",
  };

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
        return chineseTitle;
      }
    }

    // 嘗試從映射表中找到中文標題
    const englishTitle = title.english || title.romaji;
    if (englishTitle && this.chineseTitleMap[englishTitle]) {
      return this.chineseTitleMap[englishTitle];
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
