import { anilistService, AniListMedia } from "../anilist";

// Mock fetch
global.fetch = jest.fn();

const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

describe("AniListService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("searchAnime", () => {
    const mockAniListResponse = {
      data: {
        Page: {
          media: [
            {
              id: 1,
              title: {
                romaji: "Test Anime",
                english: "Test Anime English",
                native: "テストアニメ",
              },
              synonyms: ["測試動畫", "Test Anime Chinese"],
              type: "ANIME",
              status: "FINISHED",
              format: "TV",
              episodes: 12,
              duration: 24,
              averageScore: 85,
              description: "Test description",
              genres: ["Action", "Adventure"],
              season: "WINTER",
              seasonYear: 2024,
              startDate: { year: 2024, month: 1, day: 1 },
              endDate: { year: 2024, month: 3, day: 31 },
              countryOfOrigin: "JP",
            },
          ],
        },
      },
    };

    it("應該成功搜尋動畫", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockAniListResponse,
      } as Response);

      const result = await anilistService.searchAnime("test");

      expect(mockFetch).toHaveBeenCalledWith(
        "https://graphql.anilist.co",
        expect.objectContaining({
          method: "POST",
          body: expect.stringContaining("query ($search: String, $page: Int, $perPage: Int)"),
        })
      );
      expect(result).toEqual(mockAniListResponse.data.Page.media);
    });

    it("當搜尋失敗時應該拋出錯誤", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: "Internal Server Error",
      } as Response);

      await expect(anilistService.searchAnime("test")).rejects.toThrow(
        "HTTP error! status: 500"
      );
    });

    it("當網絡錯誤時應該拋出錯誤", async () => {
      mockFetch.mockRejectedValueOnce(new Error("Network error"));

      await expect(anilistService.searchAnime("test")).rejects.toThrow(
        "Network error"
      );
    });
  });

  describe("convertToTraditional", () => {
    it("應該將簡體中文轉換為繁體中文", () => {
      const simplified = "简体中文测试";
      const traditional = (anilistService as any).convertToTraditional(simplified);

      expect(traditional).toBe("簡體中文測試");
    });

    it("應該保持繁體中文不變", () => {
      const traditional = "繁體中文測試";
      const result = (anilistService as any).convertToTraditional(traditional);

      expect(result).toBe(traditional);
    });

    it("應該處理空字串", () => {
      const result = (anilistService as any).convertToTraditional("");
      expect(result).toBe("");
    });

    it("應該處理非中文字符", () => {
      const text = "Hello World 123";
      const result = (anilistService as any).convertToTraditional(text);
      expect(result).toBe(text);
    });

    it("應該正確轉換常見的簡體字詞", () => {
      const simplified = "进击的巨人 机动战士 命运石之门";
      const traditional = (anilistService as any).convertToTraditional(simplified);

      // 驗證 OpenCC 的轉換效果
      expect(traditional).toBe("進擊的巨人 機動戰士 命運石之門");
    });

    it("應該在運行時正確使用 OpenCC", () => {
      // 測試 OpenCC 是否在運行時正確加載
      const testCases = [
        { input: "简体中文", expected: "簡體中文" },
        { input: "计算机", expected: "計算機" },
        { input: "软件", expected: "軟件" },
        { input: "网络", expected: "網絡" },
      ];

      testCases.forEach(({ input, expected }) => {
        const result = (anilistService as any).convertToTraditional(input);
        expect(result).toBe(expected);
      });
    });
  });

  describe("getBestChineseTitle", () => {
    const mockAnime: AniListMedia = {
      id: 1,
      title: {
        romaji: "Test Anime",
        english: "Test Anime English",
        native: "テストアニメ",
      },
      synonyms: ["測試動畫", "Test Anime Chinese"],
      type: "ANIME",
      status: "FINISHED",
      format: "TV",
      episodes: 12,
      duration: 24,
      averageScore: 85,
      description: "Test description",
      genres: ["Action"],
      season: "WINTER",
      seasonYear: 2024,
      startDate: { year: 2024, month: 1, day: 1 },
      endDate: { year: 2024, month: 3, day: 31 },
      countryOfOrigin: "JP",
      coverImage: {
        large: "http://example.com/large.jpg",
        medium: "http://example.com/medium.jpg",
      },
      bannerImage: "http://example.com/banner.jpg",
    };

    it("應該優先返回繁體中文標題", () => {
      const result = anilistService.getBestChineseTitle(
        mockAnime.title,
        mockAnime.synonyms
      );
      expect(result).toBe("測試動畫");
    });

    it("當沒有中文標題時應該返回英文標題", () => {
      const animeWithoutChinese = {
        ...mockAnime,
        synonyms: ["Test Anime Chinese"],
      };

      const result = anilistService.getBestChineseTitle(
        animeWithoutChinese.title,
        animeWithoutChinese.synonyms
      );
      expect(result).toBe("Test Anime English");
    });

    it("當沒有英文標題時應該返回羅馬字標題", () => {
      const animeWithoutEnglish = {
        ...mockAnime,
        title: {
          romaji: "Test Anime",
          english: "" as any,
          native: "テストアニメ",
        },
        synonyms: [],
      };

      const result = anilistService.getBestChineseTitle(
        animeWithoutEnglish.title,
        animeWithoutEnglish.synonyms
      );
      expect(result).toBe("Test Anime");
    });
  });

  describe("getAllTitles", () => {
    const mockAnime: AniListMedia = {
      id: 1,
      title: {
        romaji: "Test Anime",
        english: "Test Anime English",
        native: "テストアニメ",
      },
      synonyms: ["測試動畫", "Test Anime Chinese"],
      type: "ANIME",
      status: "FINISHED",
      format: "TV",
      episodes: 12,
      duration: 24,
      averageScore: 85,
      description: "Test description",
      genres: ["Action"],
      season: "WINTER",
      seasonYear: 2024,
      startDate: { year: 2024, month: 1, day: 1 },
      endDate: { year: 2024, month: 3, day: 31 },
      countryOfOrigin: "JP",
      coverImage: {
        large: "http://example.com/large.jpg",
        medium: "http://example.com/medium.jpg",
      },
      bannerImage: "http://example.com/banner.jpg",
    };

    it("應該返回所有標題並轉換為繁體中文", () => {
      const result = anilistService.getAllTitles(
        mockAnime.title,
        mockAnime.synonyms
      );

      expect(result).toContain("測試動畫");
      expect(result).toContain("Test Anime English");
      expect(result).toContain("Test Anime");
    });

    it("應該去重並保持順序", () => {
      const animeWithDuplicates = {
        ...mockAnime,
        synonyms: ["測試動畫", "測試動畫", "Test Anime Chinese"],
      };

      const result = anilistService.getAllTitles(
        animeWithDuplicates.title,
        animeWithDuplicates.synonyms
      );

      // 檢查去重
      const uniqueTitles = new Set(result);
      expect(uniqueTitles.size).toBe(result.length);
    });
  });

  describe("convertTypeToWorkType", () => {
    it("應該正確轉換 ANIME 類型", () => {
      const result = anilistService.convertTypeToWorkType("ANIME");
      expect(result).toBe("動畫");
    });

    it("應該正確轉換 MANGA 類型", () => {
      const result = anilistService.convertTypeToWorkType("MANGA");
      expect(result).toBe("漫畫");
    });

    it("應該對未知類型返回動畫", () => {
      const result = anilistService.convertTypeToWorkType("UNKNOWN");
      expect(result).toBe("動畫");
    });
  });

  describe("convertStatus", () => {
    it("應該正確轉換各種狀態", () => {
      expect(anilistService.convertStatus("FINISHED")).toBe("已完結");
      expect(anilistService.convertStatus("RELEASING")).toBe("進行中");
      expect(anilistService.convertStatus("NOT_YET_RELEASED")).toBe("未播出");
      expect(anilistService.convertStatus("CANCELLED")).toBe("已取消");
      expect(anilistService.convertStatus("HIATUS")).toBe("暫停");
      // Fallback behavior
      expect(anilistService.convertStatus("UNKNOWN")).toBe("進行中");
    });
  });

  describe("convertFormat", () => {
    it("應該正確轉換各種格式", () => {
      expect(anilistService.convertFormat("TV")).toBe("電視動畫");
      expect(anilistService.convertFormat("MOVIE")).toBe("電影");
      expect(anilistService.convertFormat("OVA")).toBe("OVA");
      expect(anilistService.convertFormat("SPECIAL")).toBe("特別篇");
      expect(anilistService.convertFormat("ONA")).toBe("網路動畫");
      expect(anilistService.convertFormat("MUSIC")).toBe("音樂動畫");
      expect(anilistService.convertFormat("UNKNOWN")).toBe("UNKNOWN");
    });
  });

  describe("convertSeason", () => {
    it("應該正確轉換季節", () => {
      expect(anilistService.convertSeason("WINTER")).toBe("冬季");
      expect(anilistService.convertSeason("SPRING")).toBe("春季");
      expect(anilistService.convertSeason("SUMMER")).toBe("夏季");
      expect(anilistService.convertSeason("FALL")).toBe("秋季");
      expect(anilistService.convertSeason("UNKNOWN")).toBe("UNKNOWN");
    });
  });

  describe("convertRating", () => {
    it("應該正確轉換評分", () => {
      expect(anilistService.convertRating(85)).toBe(8.5);
      expect(anilistService.convertRating(90)).toBe(9.0);
      expect(anilistService.convertRating(75)).toBe(7.5);
      expect(anilistService.convertRating(null)).toBe(0);
      expect(anilistService.convertRating(undefined as any)).toBe(0);
    });
  });

  describe("getYear", () => {
    it("應該從日期對象中提取年份", () => {
      const date = { year: 2024, month: 1, day: 1 };
      const result = anilistService.getYear(date);
      expect(result).toBe(2024);
    });

    it("當沒有年份時應該返回 0", () => {
      const date = { year: null, month: 1, day: 1 };
      const result = anilistService.getYear(date);
      expect(result).toBe(0);
    });
  });

  describe("cleanDescription", () => {
    it("應該清理 HTML 標籤", () => {
      const htmlDescription = "<p>This is a <b>test</b> description</p>";
      const result = anilistService.cleanDescription(htmlDescription);
      expect(result).toBe("This is a test description");
    });

    it("當描述為 null 時應該返回空字串", () => {
      const result = anilistService.cleanDescription(null);
      expect(result).toBe("");
    });

    it("當描述為空字串時應該返回空字串", () => {
      const result = anilistService.cleanDescription("");
      expect(result).toBe("");
    });
  });
});
