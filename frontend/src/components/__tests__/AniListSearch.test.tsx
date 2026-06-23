import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import AniListSearch from "../AniListSearch";

const mockTranslations: Record<string, string> = {
  "AniListSearch.title": "Search AniList",
  "AniListSearch.searchPlaceholder": "Search anime title...",
  "AniListSearch.empty.title": "Search AniList anime",
  "AniListSearch.empty.description": "Enter an anime title to start searching.",
  "AniListSearch.empty.tip": "Tip: Chinese, Japanese and English titles are supported.",
  "AniListSearch.error.title": "Search problem",
  "AniListSearch.error.backendUnavailable": "AniList search is unavailable. Please try AniList directly.",
  "AniListSearch.error.addTitle": "Could not add this work",
  "AniListSearch.error.addFallback": "Failed to add work",
  "AniListSearch.error.openAniList": "Search on AniList",
  "AniListSearch.noResults.title": "No matching anime",
  "AniListSearch.noResults.description": "Try one of these:",
  "AniListSearch.noResults.useJapanese": "Use the Japanese title.",
  "AniListSearch.noResults.useEnglish": "Use the English title.",
  "AniListSearch.noResults.checkSpelling": "Check the spelling.",
  "AniListSearch.noResults.useShorter": "Try shorter keywords.",
  "AniListSearch.units.episodes": "{count} episodes",
  "AniListSearch.labels.selected": "Selected:",
  "AniListSearch.labels.autoCreateEpisodes": "Automatically create {count} episodes",
  "AniListSearch.buttons.close": "Close",
  "AniListSearch.buttons.select": "Select",
  "AniListSearch.buttons.addWork": "Add work",
  "AniListSearch.buttons.adding": "Adding...",
  "AniListSearch.messages.addSuccess": "Work added successfully.",
  "AniListSearch.messages.addError": "Failed to add work",
  "AniListSearch.status.finished": "Finished",
  "AniListSearch.format.tv": "TV",
  "AniListSearch.season.winter": "Winter",
  "AniListSearch.seasonYear": "{year} {season}",
};

jest.mock("next-intl", () => ({
  useTranslations:
    (namespace: string) =>
    (key: string, values?: Record<string, string | number>) => {
      const template = mockTranslations[`${namespace}.${key}`] ?? `${namespace}.${key}`;

      return Object.entries(values ?? {}).reduce(
        (message, [name, value]) =>
          message.replace(new RegExp(`{${name}}`, "g"), String(value)),
        template
      );
    },
}));

jest.mock("@/hooks/useDebounce", () => ({
  useDebounce: (value: string) => value,
}));

const mockSearchAnime = jest.fn();
jest.mock("@/lib/anilist", () => ({
  anilistService: {
    searchAnime: (...args: unknown[]) => mockSearchAnime(...args),
    getBestChineseTitle: (title: { romaji?: string }, synonyms?: string[]) =>
      synonyms?.[0] ?? title.romaji ?? "",
    convertTypeToWorkType: () => "動畫",
    convertStatus: () => "已完結",
    getYear: () => 2024,
    convertRating: () => 8.5,
    cleanDescription: (description: string | null) => description ?? "",
    convertFormat: () => "電視動畫",
    convertSeason: () => "冬季",
    getAllTitles: (title: { romaji?: string }, synonyms?: string[]) => [
      title.romaji ?? "",
      ...(synonyms ?? []),
    ],
  },
}));

const mockCreateWork = jest.fn();
jest.mock("@/store/useWorkStore", () => ({
  useWorkStore: () => ({
    createWork: mockCreateWork,
  }),
}));

const mockShowToast = jest.fn();
jest.mock("@/components/ui/toast", () => ({
  useToast: () => ({
    showToast: mockShowToast,
  }),
}));

jest.mock("../AnimeDetailModal", () => function MockAnimeDetailModal() {
  return null;
});

const animeResult = {
  id: 1,
  title: {
    romaji: "Test Anime",
    english: "Test Anime English",
    native: "テストアニメ",
  },
  synonyms: ["測試動畫"],
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
    large: "https://example.com/cover.jpg",
    medium: "https://example.com/cover-medium.jpg",
  },
  bannerImage: null,
};

const defaultProps = {
  onSelectAnime: jest.fn(),
  onClose: jest.fn(),
  onWorkAdded: jest.fn(),
  isOpen: true,
};

describe("AniListSearch", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(window, "alert").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("renders localized search chrome", () => {
    render(<AniListSearch {...defaultProps} />);

    expect(screen.getByRole("heading", { name: "Search AniList" })).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Search anime title...")).toBeInTheDocument();
    expect(screen.getByText("Search AniList anime")).toBeInTheDocument();
    expect(
      screen.getByText("Tip: Chinese, Japanese and English titles are supported.")
    ).toBeInTheDocument();
  });

  it("shows inline add errors instead of browser alerts", async () => {
    const user = userEvent.setup();
    mockSearchAnime.mockResolvedValue([animeResult]);
    mockCreateWork.mockRejectedValue(new Error("作品已存在"));

    render(<AniListSearch {...defaultProps} />);

    await user.type(screen.getByPlaceholderText("Search anime title..."), "test");

    await waitFor(() => expect(screen.getByText("測試動畫")).toBeInTheDocument());
    await user.click(screen.getByRole("button", { name: "Select" }));
    await user.click(screen.getByRole("button", { name: "Add work" }));

    expect(window.alert).not.toHaveBeenCalled();
    expect(screen.getByRole("alert")).toHaveTextContent("作品已存在");
    expect(mockShowToast).toHaveBeenCalledWith("Failed to add work", "error");
    expect(defaultProps.onClose).not.toHaveBeenCalled();
  });
});
