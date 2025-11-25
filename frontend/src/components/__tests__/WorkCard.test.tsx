import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import WorkCard from "../WorkCard";
import { Work } from "@/types";

// Mock next/navigation
jest.mock("next/navigation", () => ({
    useRouter: () => ({
        push: jest.fn(),
    }),
}));

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
        // Mock window.location.href
        delete (window as any).location;
        (window as any).location = { href: "" };
    });

    it("should render work title", () => {
        render(<WorkCard {...defaultProps} />);
        expect(screen.getByText("Test Anime Title")).toBeInTheDocument();
    });

    it("should render work status and type", () => {
        render(<WorkCard {...defaultProps} />);
        expect(screen.getByText("進行中")).toBeInTheDocument();
        expect(screen.getByText("動畫")).toBeInTheDocument();
    });

    it("should render rating when available", () => {
        render(<WorkCard {...defaultProps} />);
        expect(screen.getByText("8/10")).toBeInTheDocument();
    });

    it("should render review when available", () => {
        render(<WorkCard {...defaultProps} />);
        expect(
            screen.getByText(/This is a great anime with amazing story/)
        ).toBeInTheDocument();
    });

    it("should render year", () => {
        render(<WorkCard {...defaultProps} />);
        expect(screen.getByText("2024")).toBeInTheDocument();
    });

    it("should render episode progress", () => {
        render(<WorkCard {...defaultProps} />);
        expect(screen.getByText("1/2")).toBeInTheDocument();
    });

    it("should render tags", () => {
        render(<WorkCard {...defaultProps} />);
        expect(screen.getByText("Action")).toBeInTheDocument();
        expect(screen.getByText("Adventure")).toBeInTheDocument();
    });

    it("should show quick add button when not in batch mode", () => {
        render(<WorkCard {...defaultProps} />);
        expect(screen.getByRole("button", { name: /新增/ })).toBeInTheDocument();
    });

    it("should not show quick add button when in batch mode", () => {
        render(<WorkCard {...defaultProps} isBatchMode={true} />);
        expect(screen.queryByRole("button", { name: /新增/ })).not.toBeInTheDocument();
    });

    it("should call onQuickAdd when quick add button is clicked", async () => {
        const user = userEvent.setup();
        render(<WorkCard {...defaultProps} />);

        const quickAddButton = screen.getByRole("button", { name: /新增/ });
        await user.click(quickAddButton);

        expect(defaultProps.onQuickAdd).toHaveBeenCalledWith(
            "1",
            "Test Anime Title",
            "動畫"
        );
    });

    it("should navigate to detail page when clicked in normal mode", () => {
        render(<WorkCard {...defaultProps} />);

        const card = screen.getByText("Test Anime Title").closest(".cursor-pointer");
        fireEvent.click(card!);

        expect(window.location.href).toContain("/works/detail?id=1");
    });

    it("should show checkbox when in batch mode", () => {
        render(<WorkCard {...defaultProps} isBatchMode={true} />);

        // Should show unchecked square icon
        const card = screen.getByText("Test Anime Title").closest(".cursor-pointer");
        expect(card).toBeInTheDocument();
    });

    it("should call onToggleSelection when clicked in batch mode", () => {
        render(<WorkCard {...defaultProps} isBatchMode={true} />);

        const card = screen.getByText("Test Anime Title").closest(".cursor-pointer");
        fireEvent.click(card!);

        expect(defaultProps.onToggleSelection).toHaveBeenCalledWith("1");
    });

    it("should highlight card when selected in batch mode", () => {
        render(<WorkCard {...defaultProps} isBatchMode={true} isSelected={true} />);

        const card = screen.getByText("Test Anime Title").closest(".ring-2");
        expect(card).toHaveClass("ring-blue-500");
    });

    it("should render without rating", () => {
        const workWithoutRating = { ...mockWork, rating: undefined };
        render(<WorkCard {...defaultProps} work={workWithoutRating} />);

        expect(screen.queryByText(/\/10/)).not.toBeInTheDocument();
    });

    it("should render without review", () => {
        const workWithoutReview = { ...mockWork, review: undefined };
        render(<WorkCard {...defaultProps} work={workWithoutReview} />);

        expect(
            screen.queryByText(/This is a great anime/)
        ).not.toBeInTheDocument();
    });

    it("should render without episodes", () => {
        const workWithoutEpisodes = { ...mockWork, episodes: [] };
        render(<WorkCard {...defaultProps} work={workWithoutEpisodes} />);

        // Should not show episode progress (e.g., "1/2")
        expect(screen.queryByText("1/2")).not.toBeInTheDocument();
    });

    it("should render without tags", () => {
        const workWithoutTags = { ...mockWork, tags: [] };
        render(<WorkCard {...defaultProps} work={workWithoutTags} />);

        expect(screen.queryByText("Action")).not.toBeInTheDocument();
        expect(screen.queryByText("Adventure")).not.toBeInTheDocument();
    });

    it("should show unknown year when year is not provided", () => {
        const workWithoutYear = { ...mockWork, year: undefined };
        render(<WorkCard {...defaultProps} work={workWithoutYear} />);

        expect(screen.getByText("未知年份")).toBeInTheDocument();
    });

    it("should apply correct status color", () => {
        render(<WorkCard {...defaultProps} />);

        const statusBadge = screen.getByText("進行中");
        expect(statusBadge).toHaveClass("bg-blue-100");
    });

    it("should apply correct type color", () => {
        render(<WorkCard {...defaultProps} />);

        const typeBadge = screen.getByText("動畫");
        expect(typeBadge).toHaveClass("bg-purple-100");
    });

    it("should stop propagation when quick add button is clicked", async () => {
        const user = userEvent.setup();
        render(<WorkCard {...defaultProps} />);

        const quickAddButton = screen.getByRole("button", { name: /新增/ });
        await user.click(quickAddButton);

        // Should not navigate
        expect(window.location.href).not.toContain("/works/detail");
    });
});
