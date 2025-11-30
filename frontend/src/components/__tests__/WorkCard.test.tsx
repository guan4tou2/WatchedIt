import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import WorkCard from "../WorkCard";
import { Work } from "@/types";
import { NextIntlClientProvider } from "next-intl";

const pushMock = jest.fn();

// Mock navigation helper
jest.mock("@/navigation", () => ({
    useRouter: () => ({
        push: pushMock,
        back: jest.fn(),
    }),
}));

const testMessages = {
    Work: {
        status: {
            ongoing: "進行中",
            completed: "已完結",
            paused: "暫停",
            dropped: "放棄",
            notStarted: "未播出",
            cancelled: "已取消",
        },
        type: {
            anime: "動畫",
            movie: "電影",
            tv: "電視劇",
            novel: "小說",
            manga: "漫畫",
            game: "遊戲",
        },
    },
    WorkCard: {
        buttons: {
            quickAddFull: "新增集數",
            quickAddShort: "新增",
        },
        labels: {
            unknownYear: "未知年份",
        },
    },
};

const renderComponent = (props = defaultProps) =>
    render(
        <NextIntlClientProvider locale="zh-TW" messages={testMessages}>
            <WorkCard {...props} />
        </NextIntlClientProvider>
    );

const mockWork: Work = {
    id: "1",
    title: "Test Anime Title",
    type: "動畫",
    status: "進行中",
    year: 2024,
    rating: 8,
    review: "This is a great anime with amazing story and characters.",
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
    tags: [
        { id: 1, name: "Action", color: "#000" },
        { id: 2, name: "Adventure", color: "#000" },
    ],
    reminder_enabled: false,
    date_added: "2024-01-01",
};

const defaultProps = {
    work: mockWork,
    isBatchMode: false,
    isSelected: false,
    onToggleSelection: jest.fn(),
    onQuickAdd: jest.fn(),
};

describe("WorkCard", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        pushMock.mockClear();
    });

    it("should render work title", () => {
        renderComponent();
        expect(screen.getByText("Test Anime Title")).toBeInTheDocument();
    });

    it("should render work status and type", () => {
        renderComponent();
        expect(screen.getByText("ongoing")).toBeInTheDocument();
        expect(screen.getByText("anime")).toBeInTheDocument();
    });

    it("should render rating when available", () => {
        renderComponent();
        expect(screen.getByText("8/10")).toBeInTheDocument();
    });

    it("should render review when available", () => {
        renderComponent();
        expect(
            screen.getByText(/This is a great anime with amazing story/)
        ).toBeInTheDocument();
    });

    it("should render year", () => {
        renderComponent();
        expect(screen.getByText("2024")).toBeInTheDocument();
    });

    it("should render episode progress", () => {
        renderComponent();
        expect(screen.getByText("1/2")).toBeInTheDocument();
    });

    it("should render tags", () => {
        renderComponent();
        expect(screen.getByText("Action")).toBeInTheDocument();
        expect(screen.getByText("Adventure")).toBeInTheDocument();
    });

    it("should show quick add button when not in batch mode", () => {
        renderComponent();
        expect(screen.getByRole("button", { name: /quickAddFull/ })).toBeInTheDocument();
    });

    it("should not show quick add button when in batch mode", () => {
        renderComponent({ ...defaultProps, isBatchMode: true });
        expect(screen.queryByRole("button", { name: /quickAddFull/ })).not.toBeInTheDocument();
    });

    it("should call onQuickAdd when quick add button is clicked", async () => {
        const user = userEvent.setup();
        renderComponent();

        const quickAddButton = screen.getByRole("button", { name: /quickAddFull/ });
        await user.click(quickAddButton);

        expect(defaultProps.onQuickAdd).toHaveBeenCalledWith(
            "1",
            "Test Anime Title",
            "動畫"
        );
    });

    it("should navigate to detail page when clicked in normal mode", () => {
        renderComponent();

        const card = screen.getByText("Test Anime Title").closest(".cursor-pointer");
        fireEvent.click(card!);

        expect(pushMock).toHaveBeenCalledWith("/works/detail?id=1");
    });

    it("should show checkbox when in batch mode", () => {
        renderComponent({ ...defaultProps, isBatchMode: true });

        // Should show unchecked square icon
        const card = screen.getByText("Test Anime Title").closest(".cursor-pointer");
        expect(card).toBeInTheDocument();
    });

    it("should call onToggleSelection when clicked in batch mode", () => {
        renderComponent({ ...defaultProps, isBatchMode: true });

        const card = screen.getByText("Test Anime Title").closest(".cursor-pointer");
        fireEvent.click(card!);

        expect(defaultProps.onToggleSelection).toHaveBeenCalledWith("1");
    });

    it("should highlight card when selected in batch mode", () => {
        renderComponent({ ...defaultProps, isBatchMode: true, isSelected: true });

        const card = screen.getByText("Test Anime Title").closest(".ring-2");
        expect(card).toHaveClass("ring-blue-500");
    });

    it("should render without rating", () => {
        const workWithoutRating = { ...mockWork, rating: undefined };
        renderComponent({ ...defaultProps, work: workWithoutRating });

        expect(screen.queryByText(/\/10/)).not.toBeInTheDocument();
    });

    it("should render without review", () => {
        const workWithoutReview = { ...mockWork, review: undefined };
        renderComponent({ ...defaultProps, work: workWithoutReview });

        expect(
            screen.queryByText(/This is a great anime/)
        ).not.toBeInTheDocument();
    });

    it("should render without episodes", () => {
        const workWithoutEpisodes = { ...mockWork, episodes: [] };
        renderComponent({ ...defaultProps, work: workWithoutEpisodes });

        // Should not show episode progress (e.g., "1/2")
        expect(screen.queryByText("1/2")).not.toBeInTheDocument();
    });

    it("should render without tags", () => {
        const workWithoutTags = { ...mockWork, tags: [] };
        renderComponent({ ...defaultProps, work: workWithoutTags });

        expect(screen.queryByText("Action")).not.toBeInTheDocument();
        expect(screen.queryByText("Adventure")).not.toBeInTheDocument();
    });

    it("should show unknown year when year is not provided", () => {
        const workWithoutYear = { ...mockWork, year: undefined };
        renderComponent({ ...defaultProps, work: workWithoutYear });

        expect(screen.getByText("unknownYear")).toBeInTheDocument();
    });

    it("should apply correct status color", () => {
        renderComponent();

        const statusBadge = screen.getByText("ongoing");
        expect(statusBadge).toHaveClass("bg-blue-100");
    });

    it("should apply correct type color", () => {
        renderComponent();

        const typeBadge = screen.getByText("anime");
        expect(typeBadge).toHaveClass("bg-purple-100");
    });

    it("should stop propagation when quick add button is clicked", async () => {
        const user = userEvent.setup();
        renderComponent();

        const quickAddButton = screen.getByRole("button", { name: /quickAddFull/ });
        await user.click(quickAddButton);

        // Should not navigate
        expect(pushMock).not.toHaveBeenCalled();
    });
});
