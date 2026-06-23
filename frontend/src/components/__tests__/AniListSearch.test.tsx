import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
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
  "AniListSearch.buttons.loadMore": "Load more",
  "AniListSearch.buttons.loadingMore": "Loading more...",
  "AniListSearch.buttons.loadingDetails": "Loading details...",
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
const mockGetAnimeById = jest.fn();
jest.mock("@/lib/anilist", () => ({
  anilistService: {
    searchAnime: (...args: unknown[]) => mockSearchAnime(...args),
    getAnimeById: (...args: unknown[]) => mockGetAnimeById(...args),
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

jest.mock("../AnimeDetailModal", () => function MockAnimeDetailModal({
  anime,
  isOpen,
}: {
  anime: { description?: string | null } | null;
  isOpen: boolean;
}) {
  if (!isOpen || !anime) return null;
  return <div data-testid="anime-detail-modal">{anime.description}</div>;
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

const makeAnimeResult = (id: number) => ({
  ...animeResult,
  id,
  title: {
    ...animeResult.title,
    romaji: `Test Anime ${id}`,
  },
  synonyms: [`測試動畫 ${id}`],
});

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

    fireEvent.change(screen.getByPlaceholderText("Search anime title..."), {
      target: { value: "test" },
    });

    await waitFor(() => expect(screen.getByText("測試動畫")).toBeInTheDocument());
    await user.click(screen.getByRole("button", { name: "Select" }));
    await user.click(screen.getByRole("button", { name: "Add work" }));

    expect(window.alert).not.toHaveBeenCalled();
    expect(screen.getByRole("alert")).toHaveTextContent("作品已存在");
    expect(mockShowToast).toHaveBeenCalledWith("Failed to add work", "error");
    expect(defaultProps.onClose).not.toHaveBeenCalled();
  });

  it("requests a larger AniList page and appends more results", async () => {
    const user = userEvent.setup();
    const firstPage = Array.from({ length: 24 }, (_, index) =>
      makeAnimeResult(index + 1)
    );
    const secondPage = [makeAnimeResult(25)];
    mockSearchAnime
      .mockResolvedValueOnce(firstPage)
      .mockResolvedValueOnce(secondPage);

    render(<AniListSearch {...defaultProps} />);

    fireEvent.change(screen.getByPlaceholderText("Search anime title..."), {
      target: { value: "test" },
    });

    await waitFor(() =>
      expect(mockSearchAnime).toHaveBeenCalledWith("test", 1, 24)
    );
    expect(await screen.findByText("測試動畫 24")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Load more" }));

    await waitFor(() =>
      expect(mockSearchAnime).toHaveBeenLastCalledWith("test", 2, 24)
    );
    expect(await screen.findByText("測試動畫 25")).toBeInTheDocument();
  });

  it("loads full AniList details before opening the detail modal", async () => {
    const user = userEvent.setup();
    mockSearchAnime.mockResolvedValue([
      {
        ...animeResult,
        description: "Short search description",
      },
    ]);
    mockGetAnimeById.mockResolvedValue({
      ...animeResult,
      description: "Full AniList description",
    });

    render(<AniListSearch {...defaultProps} />);

    await user.type(screen.getByPlaceholderText("Search anime title..."), "test");
    await user.click(await screen.findByText("測試動畫"));

    await waitFor(() => expect(mockGetAnimeById).toHaveBeenCalledWith(1));
    expect(await screen.findByTestId("anime-detail-modal")).toHaveTextContent(
      "Full AniList description"
    );
  });

  it("closes when the backdrop outside the AniList search panel is clicked", async () => {
    const user = userEvent.setup();
    render(<AniListSearch {...defaultProps} />);

    await user.click(screen.getByTestId("anilist-search-backdrop"));

    expect(defaultProps.onClose).toHaveBeenCalled();
  });
});
