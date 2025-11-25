import { renderHook, act } from "@testing-library/react";
import { useWorkFilters } from "../useWorkFilters";
import { Work } from "@/types";

const mockWorks: Work[] = [
    {
        id: "1",
        title: "Test Anime 1",
        type: "動畫",
        status: "進行中",
        year: 2024,
        rating: 8,
        tags: [{ id: 1, name: "Action", color: "#000" }],
        episodes: [
            {
                id: "e1",
                number: 1,
                type: "episode",
                season: 1,
                watched: true,
            },
            {
                id: "e2",
                number: 2,
                type: "episode",
                season: 1,
                watched: false,
            },
        ],
        reminder_enabled: false,
        date_added: "2024-01-01",
    },
    {
        id: "2",
        title: "Test Movie 1",
        type: "電影",
        status: "已完結",
        year: 2023,
        rating: 9,
        tags: [{ id: 2, name: "Drama", color: "#000" }],
        episodes: [
            {
                id: "e3",
                number: 1,
                type: "movie",
                season: 1,
                watched: true,
            },
        ],
        reminder_enabled: false,
        date_added: "2023-01-01",
    },
    {
        id: "3",
        title: "Test Novel 1",
        type: "小說",
        status: "未播出",
        year: 2024,
        rating: 0,
        tags: [],
        episodes: [],
        reminder_enabled: false,
        date_added: "2024-02-01",
    },
];

describe("useWorkFilters", () => {
    it("should return all works initially", () => {
        const { result } = renderHook(() => useWorkFilters(mockWorks));
        expect(result.current.filteredWorks).toHaveLength(3);
    });

    it("should filter by search term", () => {
        const { result } = renderHook(() => useWorkFilters(mockWorks));
        act(() => {
            result.current.setSearchTerm("Anime");
        });
        expect(result.current.filteredWorks).toHaveLength(1);
        expect(result.current.filteredWorks[0].title).toBe("Test Anime 1");
    });

    it("should filter by type", () => {
        const { result } = renderHook(() => useWorkFilters(mockWorks));
        act(() => {
            result.current.setSelectedType("電影");
        });
        expect(result.current.filteredWorks).toHaveLength(1);
        expect(result.current.filteredWorks[0].title).toBe("Test Movie 1");
    });

    it("should filter by status", () => {
        const { result } = renderHook(() => useWorkFilters(mockWorks));
        act(() => {
            result.current.setSelectedStatus("已完結");
        });
        expect(result.current.filteredWorks).toHaveLength(1);
        expect(result.current.filteredWorks[0].title).toBe("Test Movie 1");
    });

    it("should filter by year", () => {
        const { result } = renderHook(() => useWorkFilters(mockWorks));
        act(() => {
            result.current.setSelectedYear("2023");
        });
        expect(result.current.filteredWorks).toHaveLength(1);
        expect(result.current.filteredWorks[0].title).toBe("Test Movie 1");
    });

    it("should filter by tags", () => {
        const { result } = renderHook(() => useWorkFilters(mockWorks));
        act(() => {
            result.current.setSelectedTags([{ id: 1, name: "Action", color: "#000" }]);
        });
        expect(result.current.filteredWorks).toHaveLength(1);
        expect(result.current.filteredWorks[0].title).toBe("Test Anime 1");
    });

    it("should filter by rating range", () => {
        const { result } = renderHook(() => useWorkFilters(mockWorks));
        act(() => {
            result.current.setRatingRange({ min: 9, max: 10 });
        });
        // Test Movie 1 (rating 9) matches, and Test Novel 1 (rating 0/undefined) passes through
        expect(result.current.filteredWorks).toHaveLength(2);
        const titles = result.current.filteredWorks.map(w => w.title);
        expect(titles).toContain("Test Movie 1");
        expect(titles).toContain("Test Novel 1");
    });

    it("should filter by progress", () => {
        const { result } = renderHook(() => useWorkFilters(mockWorks));

        // Test "進行中" - Test Anime 1 matches, Test Novel 1 (no episodes) passes through
        act(() => {
            result.current.setProgressFilter("進行中");
        });
        expect(result.current.filteredWorks).toHaveLength(2);
        const titles1 = result.current.filteredWorks.map(w => w.title);
        expect(titles1).toContain("Test Anime 1");
        expect(titles1).toContain("Test Novel 1");

        // Test "已完成" - Test Movie 1 matches, Test Novel 1 (no episodes) passes through
        act(() => {
            result.current.setProgressFilter("已完成");
        });
        expect(result.current.filteredWorks).toHaveLength(2);
        const titles2 = result.current.filteredWorks.map(w => w.title);
        expect(titles2).toContain("Test Movie 1");
        expect(titles2).toContain("Test Novel 1");
    });

    it("should clear all filters", () => {
        const { result } = renderHook(() => useWorkFilters(mockWorks));

        act(() => {
            result.current.setSearchTerm("Anime");
            result.current.setSelectedType("動畫");
        });

        expect(result.current.filteredWorks).toHaveLength(1);

        act(() => {
            result.current.clearFilters();
        });

        expect(result.current.filteredWorks).toHaveLength(3);
        expect(result.current.searchTerm).toBe("");
        expect(result.current.selectedType).toBe("");
    });
});
