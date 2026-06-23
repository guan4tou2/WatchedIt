import { render, screen } from "@testing-library/react";
import StatsOverview from "../StatsOverview";
import { Stats } from "@/types";

// Mock next-intl
jest.mock("next-intl", () => ({
    useTranslations: () => (
        key: string,
        values?: { defaultMessage?: string }
    ) => values?.defaultMessage ?? key,
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
    it("renders loading skeletons when stats is null", () => {
        const { container } = render(<StatsOverview stats={null} />);
        expect(container).not.toBeEmptyDOMElement();
        expect(container.querySelectorAll(".animate-pulse")).toHaveLength(12);
        expect(screen.queryByText("totalWorks")).not.toBeInTheDocument();
    });

    it("renders total works count correctly", () => {
        render(<StatsOverview stats={mockStats} />);
        expect(screen.getByText("totalWorks")).toBeInTheDocument();
        expect(screen.getByText("10")).toBeInTheDocument();
    });

    it("provides a compact mobile summary before the full desktop cards", () => {
        render(<StatsOverview stats={mockStats} />);

        const summary = screen.getByLabelText("作品統計摘要");

        expect(summary).toHaveClass("sm:hidden");
        expect(summary).toHaveTextContent("10作品");
        expect(summary).toHaveTextContent("3進行中");
        expect(summary).toHaveTextContent("5已完結");
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
