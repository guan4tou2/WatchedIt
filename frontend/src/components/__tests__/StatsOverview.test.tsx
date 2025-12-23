import { render, screen } from "@testing-library/react";
import StatsOverview from "../StatsOverview";
import { Stats } from "@/types";

// Mock next-intl
jest.mock("next-intl", () => ({
    useTranslations: () => (key: string) => key,
}));

const mockStats: Stats = {
    total_works: 10,
    status_stats: {
        "進行中": 3,
        "已完結": 5,
        "暫停": 1,
        "放棄": 1,
        "未播出": 0,
        "已取消": 0,
    },
    type_stats: {
        "動畫": 5,
        "電影": 3,
        "電視劇": 2,
        "小說": 0,
        "漫畫": 0,
        "遊戲": 0,
    },
    year_stats: {
        "2023": 5,
        "2024": 5,
    },
    episode_stats: {
        total_episodes: 100,
        watched_episodes: 80,
        completion_rate: 0.8,
    },
};

describe("StatsOverview", () => {
    it("renders nothing when stats is null", () => {
        const { container } = render(<StatsOverview stats={null} />);
        expect(container).toBeEmptyDOMElement();
    });

    it("renders total works count correctly", () => {
        render(<StatsOverview stats={mockStats} />);
        expect(screen.getByText("totalWorks")).toBeInTheDocument();
        expect(screen.getByText("10")).toBeInTheDocument();
    });

    it("renders ongoing works count correctly", () => {
        render(<StatsOverview stats={mockStats} />);
        expect(screen.getByText("inProgress")).toBeInTheDocument();
        expect(screen.getByText("3")).toBeInTheDocument();
    });

    it("renders completed works count correctly", () => {
        render(<StatsOverview stats={mockStats} />);
        expect(screen.getByText("completed")).toBeInTheDocument();
        expect(screen.getByText("5")).toBeInTheDocument();
    });
});
