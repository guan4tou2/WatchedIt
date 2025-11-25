"use client";

import { useEffect, useState } from "react";
import { useWorkStore } from "@/store/useWorkStore";
import { Button } from "@/components/ui/button";
import Logo from "@/components/Logo";
import { pwaService } from "@/lib/pwa";
import { getFullPath } from "@/lib/utils";
import {
  checkMigrationNeeded,
  migrateFromLocalStorage,
  clearLocalStorageData,
} from "@/lib/migration";
import Link from "next/link";
import {
  Search,
  Settings,
  Plus,
  Menu,
  CheckSquare,
  Square,
  Edit3,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import QuickAddEpisode from "@/components/QuickAddEpisode";
import AniListSearch from "@/components/AniListSearch";
import { ThemeToggle } from "@/components/ThemeToggle";
import SearchFilter from "@/components/SearchFilter";
import BatchEditModal from "@/components/BatchEditModal";
import BatchDeleteModal from "@/components/BatchDeleteModal";
import { Episode, WorkCreate } from "@/types";
import CloudSyncStatus from "@/components/CloudSyncStatus";
import { useToast } from "@/components/ui/toast";

// New Components & Hooks
import StatsOverview from "@/components/StatsOverview";
import DataReminder from "@/components/DataReminder";
import WorkList from "@/components/WorkList";
import { useWorkFilters } from "@/hooks/useWorkFilters";
import { useBatchOperations } from "@/hooks/useBatchOperations";

export default function HomePage() {
  const {
    works,
    stats,
    loading,
    error,
    initialize,
    fetchWorks,
    fetchStats,
    updateWork,
    createWork,
    deleteWork,
  } = useWorkStore();

  // Custom Hooks
  const {
    searchTerm,
    setSearchTerm,
    selectedType,
    setSelectedType,
    selectedStatus,
    setSelectedStatus,
    selectedYear,
    setSelectedYear,
    selectedTags,
    setSelectedTags,
    ratingRange,
    setRatingRange,
    progressFilter,
    setProgressFilter,
    filteredWorks,
    clearFilters,
  } = useWorkFilters(works);

  const {
    isBatchMode,
    setIsBatchMode,
    selectedWorkIds,
    showBatchEditModal,
    setShowBatchEditModal,
    showBatchDeleteModal,
    setShowBatchDeleteModal,
    toggleBatchMode,
    toggleWorkSelection,
    selectAllWorks,
    clearSelection,
    handleBatchUpdate,
    handleBatchDelete,
    selectedWorks,
  } = useBatchOperations({
    works,
    updateWork,
    deleteWork,
    fetchWorks,
    fetchStats,
  });

  // Local State
  const [quickAddEpisode, setQuickAddEpisode] = useState<{
    workId: string;
    workTitle: string;
    workType: string;
  } | null>(null);
  const [showAniListSearch, setShowAniListSearch] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  // Toast
  const { showToast, ToastContainer } = useToast();

  // Migration State
  const [migrationStatus, setMigrationStatus] = useState<{
    needsMigration: boolean;
    hasLocalData: boolean;
    hasIndexedDBData: boolean;
  } | null>(null);
  const [isMigrating, setIsMigrating] = useState(false);

  // Data Reminder State
  const [showDataReminder, setShowDataReminder] = useState(() => {
    if (typeof window !== "undefined") {
      const dismissed = localStorage.getItem(
        "watchedit_data_reminder_dismissed"
      );
      return dismissed !== "true";
    }
    return true;
  });

  // Initialization
  useEffect(() => {
    checkMigrationStatus();
    initialize();
    fetchWorks();
    fetchStats();
    pwaService.registerServiceWorker();
  }, []);

  // Handlers
  const checkMigrationStatus = async () => {
    try {
      const status = await checkMigrationNeeded();
      setMigrationStatus(status);
    } catch (error) {
      console.error("檢查遷移狀態失敗:", error);
    }
  };

  const handleMigration = async () => {
    setIsMigrating(true);
    try {
      const result = await migrateFromLocalStorage();
      if (result.success) {
        clearLocalStorageData();
        await initialize();
        await fetchWorks();
        await fetchStats();
        await checkMigrationStatus();
        alert(result.message);
      } else {
        alert(`遷移失敗: ${result.message}`);
      }
    } catch (error) {
      console.error("遷移失敗:", error);
      alert("遷移失敗，請檢查控制台錯誤信息");
    } finally {
      setIsMigrating(false);
    }
  };

  const handleQuickAddEpisode = (
    workId: string,
    workTitle: string,
    workType: string
  ) => {
    setQuickAddEpisode({ workId, workTitle, workType });
  };

  const handleEpisodeAdded = async (episode: Episode) => {
    if (!quickAddEpisode) return;
    const work = works.find((w) => w.id === quickAddEpisode.workId);
    if (!work) return;

    const existingEpisode = work.episodes?.find(
      (ep) => ep.season === episode.season && ep.number === episode.number
    );

    if (existingEpisode) {
      console.warn(`集數已存在: 第${episode.season}季第${episode.number}集`);
      return;
    }

    const updatedEpisodes = [...(work.episodes || []), episode].sort((a, b) => {
      if (a.season !== b.season) return a.season - b.season;
      return a.number - b.number;
    });

    await updateWork(work.id, { episodes: updatedEpisodes });
    await fetchWorks();
    await fetchStats();
  };

  const handleBatchEpisodesAdded = async (episodes: Episode[]) => {
    if (!quickAddEpisode) return;
    const work = works.find((w) => w.id === quickAddEpisode.workId);
    if (!work) return;

    const existingEpisodes = work.episodes || [];
    const newEpisodes = episodes.filter(
      (newEpisode) =>
        !existingEpisodes.some(
          (existing) =>
            existing.season === newEpisode.season &&
            existing.number === newEpisode.number
        )
    );

    if (newEpisodes.length === 0) {
      console.warn("所有集數都已存在");
      return;
    }

    const updatedEpisodes = [...existingEpisodes, ...newEpisodes].sort(
      (a, b) => {
        if (a.season !== b.season) return a.season - b.season;
        return a.number - b.number;
      }
    );

    await updateWork(work.id, { episodes: updatedEpisodes });
    await fetchWorks();
    await fetchStats();
  };

  const handleAniListSelect = (workData: WorkCreate) => {
    // Legacy handler
  };

  // Derived Data
  const availableTypes = Array.from(new Set(works.map((w) => w.type)));
  const availableStatuses = Array.from(new Set(works.map((w) => w.status)));
  const availableYears = Array.from(
    new Set(
      works
        .map((w) => w.year)
        .filter((year): year is number => year !== undefined)
    )
  ).sort((a, b) => b - a);

  const allTags = Array.from(
    new Set(
      works.flatMap((w) => w.tags || []).map((tag) => JSON.stringify(tag))
    )
  ).map((tagStr) => JSON.parse(tagStr));

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">載入中...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-red-100 dark:bg-red-900/20 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-200 px-4 py-3 rounded">
          錯誤: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 page-enter-active">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <Logo />

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center space-x-2">
          <ThemeToggle />
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAniListSearch(true)}
            className="active:scale-95 transition-transform"
          >
            <Search className="w-4 h-4 mr-1" />
            搜尋動畫
          </Button>
          <Link href={getFullPath("/settings")}>
            <Button
              variant="outline"
              size="sm"
              className="active:scale-95 transition-transform"
            >
              <Settings className="w-4 h-4 mr-1" />
              設定
            </Button>
          </Link>
          <Link href={getFullPath("/works/new")}>
            <Button className="active:scale-95 transition-transform">
              <Plus className="w-4 h-4 mr-2" />
              新增作品
            </Button>
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="active:scale-95 transition-transform"
          >
            <Menu className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {showMobileMenu && (
        <div className="md:hidden mb-4 p-4 bg-white dark:bg-gray-800 rounded-lg border shadow-lg animate-fade-in-up">
          <div className="flex flex-col space-y-2">
            <ThemeToggle />
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setShowAniListSearch(true);
                setShowMobileMenu(false);
              }}
            >
              <Search className="w-4 h-4 mr-1" />
              搜尋動畫
            </Button>
            <Link href={getFullPath("/settings")}>
              <Button variant="outline" size="sm" className="w-full">
                <Settings className="w-4 h-4 mr-1" />
                設定
              </Button>
            </Link>
            <Link href={getFullPath("/works/new")}>
              <Button className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                新增作品
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Stats */}
      <StatsOverview stats={stats} />

      {/* Data Reminder */}
      <DataReminder
        show={showDataReminder}
        onDismiss={() => {
          setShowDataReminder(false);
          localStorage.setItem("watchedit_data_reminder_dismissed", "true");
        }}
      />

      {/* Filters */}
      <div className="mb-6">
        <SearchFilter
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          selectedType={selectedType}
          onTypeChange={setSelectedType}
          selectedStatus={selectedStatus}
          onStatusChange={setSelectedStatus}
          selectedYear={selectedYear}
          onYearChange={setSelectedYear}
          selectedTags={selectedTags}
          onTagsChange={setSelectedTags}
          ratingRange={ratingRange}
          onRatingChange={setRatingRange}
          progressFilter={progressFilter}
          onProgressChange={setProgressFilter}
          onClearFilters={clearFilters}
          availableTypes={availableTypes}
          availableStatuses={availableStatuses}
          availableYears={availableYears}
          allTags={allTags}
          works={works}
        />
      </div>

      {/* Migration Alert */}
      {migrationStatus?.needsMigration && (
        <div className="bg-yellow-100 dark:bg-yellow-900/20 border border-yellow-400 dark:border-yellow-800 text-yellow-700 dark:text-yellow-200 px-4 py-3 rounded mb-6 flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 animate-fade-in-up">
          <div className="flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2 flex-shrink-0" />
            <span className="text-sm">發現舊版數據，建議進行數據遷移。</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleMigration}
            disabled={isMigrating}
            className="flex-shrink-0"
          >
            {isMigrating ? "遷移中..." : "立即遷移"}
          </Button>
        </div>
      )}

      {/* Works List Header */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
          <div className="flex items-center space-x-4">
            <h2 className="text-lg sm:text-xl font-semibold dark:text-foreground/98">
              {searchTerm ||
                selectedType ||
                selectedStatus ||
                selectedYear ||
                selectedTags.length > 0 ||
                ratingRange.min !== 0 ||
                ratingRange.max !== 10 ||
                progressFilter
                ? "搜尋結果"
                : "最近作品"}
            </h2>

            {/* Batch Actions */}
            {filteredWorks.length > 0 && (
              <div className="flex items-center space-x-2">
                <Button
                  variant={isBatchMode ? "default" : "outline"}
                  size="sm"
                  onClick={toggleBatchMode}
                  className="active:scale-95 transition-transform"
                >
                  {isBatchMode ? (
                    <>
                      <CheckSquare className="w-4 h-4 mr-1" />
                      批量模式
                    </>
                  ) : (
                    <>
                      <Square className="w-4 h-4 mr-1" />
                      批量選擇
                    </>
                  )}
                </Button>

                {isBatchMode && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => selectAllWorks(filteredWorks)}
                    >
                      全選
                    </Button>
                    <Button variant="outline" size="sm" onClick={clearSelection}>
                      清除
                    </Button>
                    {selectedWorkIds.size > 0 && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => setShowBatchEditModal(true)}
                        >
                          <Edit3 className="w-4 h-4 mr-1" />
                          批量編輯 ({selectedWorkIds.size})
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => setShowBatchDeleteModal(true)}
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          批量刪除 ({selectedWorkIds.size})
                        </Button>
                      </>
                    )}
                  </>
                )}
              </div>
            )}
          </div>

          {filteredWorks.length > 0 && (
            <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
              <span>共 {filteredWorks.length} 個作品</span>
              {works.length !== filteredWorks.length && (
                <span>（從 {works.length} 個中篩選）</span>
              )}
              {searchTerm && <span>搜尋：「{searchTerm}」</span>}
            </div>
          )}
        </div>

        {/* Works List */}
        <WorkList
          works={filteredWorks}
          totalWorks={works.length}
          isBatchMode={isBatchMode}
          selectedWorkIds={selectedWorkIds}
          onToggleSelection={toggleWorkSelection}
          onQuickAdd={handleQuickAddEpisode}
        />
      </div>

      {/* Modals */}
      {quickAddEpisode && (
        <QuickAddEpisode
          workId={quickAddEpisode.workId}
          workTitle={quickAddEpisode.workTitle}
          workType={quickAddEpisode.workType}
          currentEpisodes={
            works.find((w) => w.id === quickAddEpisode.workId)?.episodes || []
          }
          onEpisodeAdded={handleEpisodeAdded}
          onBatchEpisodesAdded={handleBatchEpisodesAdded}
          onClose={() => setQuickAddEpisode(null)}
        />
      )}

      <AniListSearch
        onSelectAnime={handleAniListSelect}
        onClose={async () => {
          setShowAniListSearch(false);
          try {
            await fetchWorks();
            await fetchStats();
          } catch (error) {
            console.error("重新載入數據失敗:", error);
            showToast("重新載入數據失敗", "error");
          }
        }}
        onWorkAdded={async () => {
          try {
            await fetchWorks();
            await fetchStats();
            showToast("作品新增成功！", "success");
          } catch (error) {
            console.error("重新載入數據失敗:", error);
            showToast("重新載入數據失敗", "error");
          }
        }}
        isOpen={showAniListSearch}
      />

      <BatchEditModal
        isOpen={showBatchEditModal}
        onClose={() => setShowBatchEditModal(false)}
        selectedWorks={selectedWorks}
        allTags={allTags}
        onBatchUpdate={handleBatchUpdate}
      />

      <BatchDeleteModal
        isOpen={showBatchDeleteModal}
        onClose={() => setShowBatchDeleteModal(false)}
        selectedWorks={selectedWorks}
        onBatchDelete={handleBatchDelete}
      />

      <CloudSyncStatus />
      <ToastContainer />

      {/* GitHub Link */}
      <div className="fixed bottom-4 right-4 z-50">
        <a
          href="https://github.com/guan4tou2/WatchedIt"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center w-12 h-12 bg-gray-900 hover:bg-gray-800 text-white rounded-full shadow-lg transition-colors duration-200"
          title="查看 GitHub Repository"
        >
          <svg
            className="w-6 h-6"
            fill="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
              clipRule="evenodd"
            />
          </svg>
        </a>
      </div>
    </div>
  );
}

