import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import SearchFilter from "../SearchFilter";
import { Tag } from "@/types";

// Mock next-intl
jest.mock("next-intl", () => ({
    useTranslations: () => (key: string) => key,
}));

const mockTags: Tag[] = [
    { id: 1, name: "Action", color: "#000" },
    { id: 2, name: "Drama", color: "#000" },
];

const mockWorks = [
    { title: "Test Anime" },
    { title: "Test Movie" },
];

describe("SearchFilter", () => {
    const defaultProps = {
        searchTerm: "",
        onSearchChange: jest.fn(),
        selectedType: "",
        onTypeChange: jest.fn(),
        selectedStatus: "",
        onStatusChange: jest.fn(),
        selectedYear: "",
        onYearChange: jest.fn(),
        selectedTags: [],
        onTagsChange: jest.fn(),
        ratingRange: { min: 0, max: 10 },
        onRatingChange: jest.fn(),
        progressFilter: "",
        onProgressChange: jest.fn(),
        onClearFilters: jest.fn(),
        availableTypes: ["動畫", "電影"],
        availableStatuses: ["進行中", "已完結"],
        availableYears: [2024, 2023],
        allTags: mockTags,
        works: mockWorks,
    };

    it("renders search input correctly", () => {
        render(<SearchFilter {...defaultProps} />);
        expect(screen.getByPlaceholderText("placeholder")).toBeInTheDocument();
    });

    it("calls onSearchChange when input changes", () => {
        render(<SearchFilter {...defaultProps} />);
        const input = screen.getByPlaceholderText("placeholder");
        fireEvent.change(input, { target: { value: "test" } });
        expect(defaultProps.onSearchChange).toHaveBeenCalledWith("test");
    });

    it("toggles detailed filters when filter button is clicked", () => {
        render(<SearchFilter {...defaultProps} />);
        const filterButton = screen.getByText("buttons.filter");
        fireEvent.click(filterButton);
        expect(screen.getByText("details.title")).toBeInTheDocument();
    });

    it("calls onTypeChange when type is selected", () => {
        render(<SearchFilter {...defaultProps} />);
        fireEvent.click(screen.getByText("buttons.filter")); // Open filters
        const select = screen.getByLabelText("details.basic.typeLabel");
        fireEvent.change(select, { target: { value: "動畫" } });
        expect(defaultProps.onTypeChange).toHaveBeenCalledWith("動畫");
    });

    it("calls onStatusChange when status is selected", () => {
        render(<SearchFilter {...defaultProps} />);
        fireEvent.click(screen.getByText("buttons.filter")); // Open filters
        const select = screen.getByLabelText("details.basic.statusLabel");
        fireEvent.change(select, { target: { value: "進行中" } });
        expect(defaultProps.onStatusChange).toHaveBeenCalledWith("進行中");
    });

    it("calls onClearFilters when clear button is clicked", () => {
        // Render with active filter to show clear button
        render(<SearchFilter {...defaultProps} searchTerm="test" />);
        const clearButton = screen.getByText("clear");
        fireEvent.click(clearButton);
        expect(defaultProps.onClearFilters).toHaveBeenCalled();
    });

    it("shows search suggestions when typing", async () => {
        render(<SearchFilter {...defaultProps} searchTerm="Test" />);
        const input = screen.getByPlaceholderText("placeholder");
        fireEvent.focus(input);

        expect(screen.getByText("suggestions.title")).toBeInTheDocument();
        expect(screen.getByText("Test Anime")).toBeInTheDocument();
    });
});
