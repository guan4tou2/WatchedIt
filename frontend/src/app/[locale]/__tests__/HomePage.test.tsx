import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import HomePage from "../page";
import {
  checkMigrationNeeded,
  clearLocalStorageData,
  migrateFromLocalStorage,
} from "@/lib/migration";

const initialize = jest.fn();
const fetchWorks = jest.fn();
const fetchStats = jest.fn();
const updateWork = jest.fn();
const createWork = jest.fn();
const deleteWork = jest.fn();
const showToast = jest.fn();

jest.mock("@/navigation", () => ({
  Link: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

jest.mock("next-intl", () => ({
  useTranslations:
    (namespace: string) =>
    (key: string, values?: Record<string, string | number>) => {
      const messages: Record<string, string> = {
        "Common.loading": "載入中",
        "Common.error": "錯誤",
        "Home.actions.searchAnime": "搜尋動畫",
        "Home.actions.settings": "設定",
        "Home.actions.addWork": "新增作品",
        "Home.actions.openMenu": "開啟選單",
        "Home.actions.closeMenu": "關閉選單",
        "Home.actions.mainMenu": "主選單",
        "Home.actions.viewGithub": "GitHub",
        "Home.labels.recentWorks": "最近作品",
        "Home.labels.searchResults": "搜尋結果",
        "Home.labels.itemsCount": `${values?.count ?? 0} 個項目`,
        "Home.labels.filteredFrom": `共 ${values?.total ?? 0} 個`,
        "Home.labels.searchTerm": `搜尋 ${values?.term ?? ""}`,
        "Home.migration.notice": "發現舊版數據，建議進行數據遷移。",
        "Home.migration.button": "立即遷移",
        "Home.migration.inProgress": "遷移中...",
      };

      return messages[`${namespace}.${key}`] ?? `${namespace}.${key}`;
    },
}));

jest.mock("@/store/useWorkStore", () => ({
  useWorkStore: () => ({
    works: [],
    stats: {},
    loading: false,
    error: null,
    initialize,
    fetchWorks,
    fetchStats,
    updateWork,
    createWork,
    deleteWork,
  }),
}));

jest.mock("@/hooks/useWorkFilters", () => ({
  useWorkFilters: () => ({
    searchTerm: "",
    setSearchTerm: jest.fn(),
    selectedType: "",
    setSelectedType: jest.fn(),
    selectedStatus: "",
    setSelectedStatus: jest.fn(),
    selectedYear: "",
    setSelectedYear: jest.fn(),
    selectedTags: [],
    setSelectedTags: jest.fn(),
    ratingRange: { min: 0, max: 10 },
    setRatingRange: jest.fn(),
    progressFilter: "",
    setProgressFilter: jest.fn(),
    filteredWorks: [],
    clearFilters: jest.fn(),
  }),
}));

jest.mock("@/hooks/useBatchOperations", () => ({
  useBatchOperations: () => ({
    isBatchMode: false,
    setIsBatchMode: jest.fn(),
    selectedWorkIds: new Set<string>(),
    showBatchEditModal: false,
    setShowBatchEditModal: jest.fn(),
    showBatchDeleteModal: false,
    setShowBatchDeleteModal: jest.fn(),
    toggleBatchMode: jest.fn(),
    toggleWorkSelection: jest.fn(),
    selectAllWorks: jest.fn(),
    clearSelection: jest.fn(),
    handleBatchUpdate: jest.fn(),
    handleBatchDelete: jest.fn(),
    selectedWorks: [],
  }),
}));

jest.mock("@/lib/migration", () => ({
  checkMigrationNeeded: jest.fn(),
  migrateFromLocalStorage: jest.fn(),
  clearLocalStorageData: jest.fn(),
}));

jest.mock("@/lib/pwa", () => ({
  pwaService: {
    registerServiceWorker: jest.fn(),
  },
}));

jest.mock("@/components/ui/toast", () => ({
  useToast: () => ({
    showToast,
    ToastContainer: () => <div data-testid="toast-container" />,
  }),
}));

jest.mock("@/components/Logo", () => function Logo() {
  return <span>WatchedIt</span>;
});
jest.mock("@/components/QuickAddEpisode", () => function QuickAddEpisode() {
  return <div data-testid="quick-add-episode" />;
});
jest.mock("@/components/AniListSearch", () => function AniListSearch() {
  return <div data-testid="anilist-search" />;
});
jest.mock("@/components/ThemeToggle", () => ({
  ThemeToggle: () => <button>切換主題</button>,
}));
jest.mock("@/components/SearchFilter", () => function SearchFilter() {
  return <div data-testid="search-filter" />;
});
jest.mock("@/components/BatchEditModal", () => function BatchEditModal() {
  return <div data-testid="batch-edit-modal" />;
});
jest.mock("@/components/BatchDeleteModal", () => function BatchDeleteModal() {
  return <div data-testid="batch-delete-modal" />;
});
jest.mock("@/components/CloudSyncStatus", () => function CloudSyncStatus() {
  return <div data-testid="cloud-sync-status" />;
});
jest.mock("@/components/StatsOverview", () => function StatsOverview() {
  return <div data-testid="stats-overview" />;
});
jest.mock("@/components/DataReminder", () => function DataReminder() {
  return <div data-testid="data-reminder" />;
});
jest.mock("@/components/WorkList", () => function WorkList() {
  return <div data-testid="work-list" />;
});
jest.mock("@/components/SyncIndicator", () => function SyncIndicator() {
  return <div data-testid="sync-indicator" />;
});
jest.mock("@/components/BatchActionBar", () => function BatchActionBar() {
  return <div data-testid="batch-action-bar" />;
});

describe("HomePage migration", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    initialize.mockResolvedValue(undefined);
    fetchWorks.mockResolvedValue(undefined);
    fetchStats.mockResolvedValue(undefined);
    jest.mocked(checkMigrationNeeded).mockResolvedValue({
      needsMigration: true,
      hasLocalData: true,
      hasIndexedDBData: false,
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("shows migration success inline instead of using browser alerts", async () => {
    const user = userEvent.setup();
    const alertSpy = jest.spyOn(window, "alert").mockImplementation(() => {});
    jest.mocked(migrateFromLocalStorage).mockResolvedValue({
      success: true,
      message: "遷移完成！成功遷移 2 個作品和 1 個標籤",
      migratedWorks: 2,
      migratedTags: 1,
    });

    render(<HomePage />);

    await user.click(
      await screen.findByRole("button", { name: "立即遷移" })
    );

    await waitFor(() =>
      expect(clearLocalStorageData).toHaveBeenCalledTimes(1)
    );
    expect(alertSpy).not.toHaveBeenCalled();
    expect(
      await screen.findByRole("status", {
        name: "資料遷移狀態",
      })
    ).toHaveTextContent("遷移完成！成功遷移 2 個作品和 1 個標籤");
  });

  it("shows migration failures inline instead of using browser alerts", async () => {
    const user = userEvent.setup();
    const alertSpy = jest.spyOn(window, "alert").mockImplementation(() => {});
    jest.mocked(migrateFromLocalStorage).mockResolvedValue({
      success: false,
      message: "IndexedDB 已有數據，無法遷移",
      migratedWorks: 0,
      migratedTags: 0,
    });

    render(<HomePage />);

    await user.click(
      await screen.findByRole("button", { name: "立即遷移" })
    );

    await waitFor(() =>
      expect(migrateFromLocalStorage).toHaveBeenCalledTimes(1)
    );
    expect(clearLocalStorageData).not.toHaveBeenCalled();
    expect(alertSpy).not.toHaveBeenCalled();
    expect(
      await screen.findByRole("alert", {
        name: "資料遷移狀態",
      })
    ).toHaveTextContent("遷移失敗: IndexedDB 已有數據，無法遷移");
  });

  it("exposes an accessible mobile navigation toggle", async () => {
    const user = userEvent.setup();

    render(<HomePage />);

    const menuButton = screen.getByRole("button", { name: "開啟選單" });
    expect(menuButton).toHaveAttribute("aria-expanded", "false");

    await user.click(menuButton);

    expect(screen.getByRole("button", { name: "關閉選單" })).toHaveAttribute(
      "aria-expanded",
      "true"
    );
    expect(screen.getByRole("navigation", { name: "主選單" })).toBeInTheDocument();
  });
});
