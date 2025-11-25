import { renderHook, act, waitFor } from "@testing-library/react";
import { useBatchOperations } from "../useBatchOperations";
import { Work, WorkUpdate } from "@/types";

const mockWorks: Work[] = [
    {
        id: "1",
        title: "Test Work 1",
        type: "動畫",
        status: "進行中",
        episodes: [],
        tags: [],
        reminder_enabled: false,
        date_added: "2024-01-01",
    },
    {
        id: "2",
        title: "Test Work 2",
        type: "電影",
        status: "已完結",
        episodes: [],
        tags: [],
        reminder_enabled: false,
        date_added: "2024-01-02",
    },
    {
        id: "3",
        title: "Test Work 3",
        type: "小說",
        status: "暫停",
        episodes: [],
        tags: [],
        reminder_enabled: false,
        date_added: "2024-01-03",
    },
];

describe("useBatchOperations", () => {
    const mockUpdateWork = jest.fn();
    const mockDeleteWork = jest.fn();
    const mockFetchWorks = jest.fn();
    const mockFetchStats = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        mockUpdateWork.mockResolvedValue({});
        mockDeleteWork.mockResolvedValue({});
        mockFetchWorks.mockResolvedValue({});
        mockFetchStats.mockResolvedValue({});
    });

    const defaultProps = {
        works: mockWorks,
        updateWork: mockUpdateWork,
        deleteWork: mockDeleteWork,
        fetchWorks: mockFetchWorks,
        fetchStats: mockFetchStats,
    };

    it("should initialize with batch mode off", () => {
        const { result } = renderHook(() => useBatchOperations(defaultProps));

        expect(result.current.isBatchMode).toBe(false);
        expect(result.current.selectedWorkIds.size).toBe(0);
    });

    it("should toggle batch mode", () => {
        const { result } = renderHook(() => useBatchOperations(defaultProps));

        act(() => {
            result.current.toggleBatchMode();
        });

        expect(result.current.isBatchMode).toBe(true);

        act(() => {
            result.current.toggleBatchMode();
        });

        expect(result.current.isBatchMode).toBe(false);
    });

    it("should toggle work selection", () => {
        const { result } = renderHook(() => useBatchOperations(defaultProps));

        act(() => {
            result.current.toggleWorkSelection("1");
        });

        expect(result.current.selectedWorkIds.has("1")).toBe(true);

        act(() => {
            result.current.toggleWorkSelection("1");
        });

        expect(result.current.selectedWorkIds.has("1")).toBe(false);
    });

    it("should select all works", () => {
        const { result } = renderHook(() => useBatchOperations(defaultProps));

        act(() => {
            result.current.selectAllWorks(mockWorks);
        });

        expect(result.current.selectedWorkIds.size).toBe(3);
        expect(result.current.selectedWorkIds.has("1")).toBe(true);
        expect(result.current.selectedWorkIds.has("2")).toBe(true);
        expect(result.current.selectedWorkIds.has("3")).toBe(true);
    });

    it("should clear selection", () => {
        const { result } = renderHook(() => useBatchOperations(defaultProps));

        act(() => {
            result.current.selectAllWorks(mockWorks);
        });

        expect(result.current.selectedWorkIds.size).toBe(3);

        act(() => {
            result.current.clearSelection();
        });

        expect(result.current.selectedWorkIds.size).toBe(0);
    });

    it("should handle batch update", async () => {
        const { result } = renderHook(() => useBatchOperations(defaultProps));

        // Select two works
        act(() => {
            result.current.toggleWorkSelection("1");
        });
        act(() => {
            result.current.toggleWorkSelection("2");
        });

        const updates: WorkUpdate = { status: "已完結" };

        await act(async () => {
            await result.current.handleBatchUpdate(updates);
        });

        expect(mockUpdateWork).toHaveBeenCalledTimes(2);
        expect(mockUpdateWork).toHaveBeenCalledWith("1", updates);
        expect(mockUpdateWork).toHaveBeenCalledWith("2", updates);
        expect(mockFetchWorks).toHaveBeenCalled();
        expect(mockFetchStats).toHaveBeenCalled();
        expect(result.current.selectedWorkIds.size).toBe(0);
        expect(result.current.isBatchMode).toBe(false);
    });

    it("should handle batch delete", async () => {
        const { result } = renderHook(() => useBatchOperations(defaultProps));

        // Select two works
        act(() => {
            result.current.toggleWorkSelection("1");
        });
        act(() => {
            result.current.toggleWorkSelection("3");
        });

        await act(async () => {
            await result.current.handleBatchDelete();
        });

        expect(mockDeleteWork).toHaveBeenCalledTimes(2);
        expect(mockDeleteWork).toHaveBeenCalledWith("1");
        expect(mockDeleteWork).toHaveBeenCalledWith("3");
        expect(mockFetchWorks).toHaveBeenCalled();
        expect(mockFetchStats).toHaveBeenCalled();
        expect(result.current.selectedWorkIds.size).toBe(0);
        expect(result.current.isBatchMode).toBe(false);
    });

    it("should return selected works", () => {
        const { result } = renderHook(() => useBatchOperations(defaultProps));

        act(() => {
            result.current.toggleWorkSelection("1");
        });
        act(() => {
            result.current.toggleWorkSelection("2");
        });

        expect(result.current.selectedWorks).toHaveLength(2);
        expect(result.current.selectedWorks[0].id).toBe("1");
        expect(result.current.selectedWorks[1].id).toBe("2");
    });

    it("should handle errors in batch update", async () => {
        const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();
        mockUpdateWork.mockRejectedValueOnce(new Error("Update failed"));

        const { result } = renderHook(() => useBatchOperations(defaultProps));

        act(() => {
            result.current.toggleWorkSelection("1");
        });

        await act(async () => {
            await result.current.handleBatchUpdate({ status: "已完結" });
        });

        expect(consoleErrorSpy).toHaveBeenCalledWith(
            "批量更新失敗:",
            expect.any(Error)
        );

        consoleErrorSpy.mockRestore();
    });

    it("should handle errors in batch delete", async () => {
        const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();
        mockDeleteWork.mockRejectedValueOnce(new Error("Delete failed"));

        const { result } = renderHook(() => useBatchOperations(defaultProps));

        act(() => {
            result.current.toggleWorkSelection("1");
        });

        await act(async () => {
            await result.current.handleBatchDelete();
        });

        expect(consoleErrorSpy).toHaveBeenCalledWith(
            "批量刪除失敗:",
            expect.any(Error)
        );

        consoleErrorSpy.mockRestore();
    });

    it("should clear selection when toggling batch mode off", () => {
        const { result } = renderHook(() => useBatchOperations(defaultProps));

        act(() => {
            result.current.setIsBatchMode(true);
        });
        act(() => {
            result.current.toggleWorkSelection("1");
        });
        act(() => {
            result.current.toggleWorkSelection("2");
        });

        expect(result.current.selectedWorkIds.size).toBe(2);

        act(() => {
            result.current.toggleBatchMode();
        });

        expect(result.current.isBatchMode).toBe(false);
        expect(result.current.selectedWorkIds.size).toBe(0);
    });
});
