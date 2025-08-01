"use client";

import { useEffect, useState } from "react";
import { useWorkStore } from "@/store/useWorkStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
  ArrowRight,
  Play,
  Check,
  Eye,
  Plus,
  Settings,
  Search,
  X,
  Database,
  AlertTriangle,
  Menu,
  Star,
  Calendar,
  Info,
  Edit3,
  Square,
  CheckSquare,
  Trash2,
} from "lucide-react";
import QuickAddEpisode from "@/components/QuickAddEpisode";
import AniListSearch from "@/components/AniListSearch";
import { ThemeToggle } from "@/components/ThemeToggle";
import SearchFilter from "@/components/SearchFilter";
import BatchEditModal from "@/components/BatchEditModal";
import BatchDeleteModal from "@/components/BatchDeleteModal";
import { Episode, WorkCreate, Tag } from "@/types";
import CloudSyncStatus from "@/components/CloudSyncStatus";

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
  const [quickAddEpisode, setQuickAddEpisode] = useState<{
    workId: string;
    workTitle: string;
    workType: string;
  } | null>(null);
  const [showAniListSearch, setShowAniListSearch] = useState(false);

  // 搜尋和篩選狀態
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [selectedYear, setSelectedYear] = useState<string>("");
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
  const [ratingRange, setRatingRange] = useState<{ min: number; max: number }>({
    min: 0,
    max: 5,
  });
  const [progressFilter, setProgressFilter] = useState<string>("");

  // 批量選擇狀態
  const [isBatchMode, setIsBatchMode] = useState(false);
  const [selectedWorkIds, setSelectedWorkIds] = useState<Set<string>>(
    new Set()
  );
  const [showBatchEditModal, setShowBatchEditModal] = useState(false);
  const [showBatchDeleteModal, setShowBatchDeleteModal] = useState(false);

  // 遷移狀態
  const [migrationStatus, setMigrationStatus] = useState<{
    needsMigration: boolean;
    hasLocalData: boolean;
    hasIndexedDBData: boolean;
  } | null>(null);
  const [isMigrating, setIsMigrating] = useState(false);

  // 移動端選單狀態
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  // 資料提醒狀態
  const [showDataReminder, setShowDataReminder] = useState(() => {
    if (typeof window !== "undefined") {
      const dismissed = localStorage.getItem(
        "watchedit_data_reminder_dismissed"
      );
      return dismissed !== "true";
    }
    return true;
  });

  useEffect(() => {
    // 檢查是否需要數據遷移
    checkMigrationStatus();

    // 初始化本地儲存
    initialize();

    // 載入數據
    fetchWorks();
    fetchStats();

    // 註冊 PWA 服務
    pwaService.registerServiceWorker();
  }, [initialize, fetchWorks, fetchStats]);

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
        // 清理 localStorage 數據
        clearLocalStorageData();

        // 重新載入數據
        await initialize();
        await fetchWorks();
        await fetchStats();

        // 重新檢查遷移狀態
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

    // 檢查是否已經有這個集數（避免重複添加）
    const existingEpisode = work.episodes?.find(
      (ep) => ep.season === episode.season && ep.number === episode.number
    );

    if (existingEpisode) {
      // 如果集數已存在，顯示警告並跳過
      console.warn(`集數已存在: 第${episode.season}季第${episode.number}集`);
      return;
    }

    const updatedEpisodes = [...(work.episodes || []), episode].sort((a, b) => {
      if (a.season !== b.season) return a.season - b.season;
      return a.number - b.number;
    });

    await updateWork(work.id, { episodes: updatedEpisodes });
  };

  // 批量添加集數的函數
  const handleBatchEpisodesAdded = (episodes: Episode[]) => {
    if (!quickAddEpisode) return;

    const work = works.find((w) => w.id === quickAddEpisode.workId);
    if (!work) return;

    // 過濾掉已存在的集數
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

    updateWork(work.id, { episodes: updatedEpisodes });
  };

  const handleQuickAddClose = () => {
    setQuickAddEpisode(null);
  };

  const handleAniListSelect = (workData: WorkCreate) => {
    // 這個函數現在只是一個空函數，因為實際的新增邏輯已經在組件內部處理
    // 保留它是為了向後相容性
  };

  // 篩選作品
  const filteredWorks = works.filter((work) => {
    // 搜尋篩選
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const matchesTitle = work.title.toLowerCase().includes(searchLower);
      const matchesReview =
        work.review?.toLowerCase().includes(searchLower) || false;
      const matchesNote =
        work.note?.toLowerCase().includes(searchLower) || false;
      const matchesTags =
        work.tags?.some((tag) =>
          tag.name.toLowerCase().includes(searchLower)
        ) || false;
      if (!matchesTitle && !matchesReview && !matchesNote && !matchesTags)
        return false;
    }

    // 類型篩選
    if (selectedType && work.type !== selectedType) return false;

    // 狀態篩選
    if (selectedStatus && work.status !== selectedStatus) return false;

    // 年份篩選
    if (selectedYear && work.year?.toString() !== selectedYear) return false;

    // 標籤篩選
    if (selectedTags.length > 0) {
      const workTagIds = work.tags?.map((tag) => tag.id) || [];
      const hasSelectedTag = selectedTags.some((tag) =>
        workTagIds.includes(tag.id)
      );
      if (!hasSelectedTag) return false;
    }

    // 評分篩選
    if (work.rating) {
      if (work.rating < ratingRange.min || work.rating > ratingRange.max) {
        return false;
      }
    }

    // 進度篩選
    if (progressFilter && work.episodes && work.episodes.length > 0) {
      const watchedCount = work.episodes.filter((ep) => ep.watched).length;
      const totalEpisodes = work.episodes.length;
      const progress =
        totalEpisodes > 0 ? (watchedCount / totalEpisodes) * 100 : 0;

      switch (progressFilter) {
        case "未開始":
          if (watchedCount > 0) return false;
          break;
        case "進行中":
          if (watchedCount === 0 || watchedCount === totalEpisodes)
            return false;
          break;
        case "已完成":
          if (watchedCount !== totalEpisodes) return false;
          break;
        case "高進度":
          if (progress < 80) return false;
          break;
        case "低進度":
          if (progress >= 20) return false;
          break;
      }
    }

    return true;
  });

  // 清除所有篩選
  const clearFilters = () => {
    setSearchTerm("");
    setSelectedType("");
    setSelectedStatus("");
    setSelectedYear("");
    setSelectedTags([]);
    setRatingRange({ min: 0, max: 5 });
    setProgressFilter("");
  };

  // 批量操作函數
  const toggleBatchMode = () => {
    setIsBatchMode(!isBatchMode);
    setSelectedWorkIds(new Set());
  };

  const toggleWorkSelection = (workId: string) => {
    const newSelectedIds = new Set(selectedWorkIds);
    if (newSelectedIds.has(workId)) {
      newSelectedIds.delete(workId);
    } else {
      newSelectedIds.add(workId);
    }
    setSelectedWorkIds(newSelectedIds);
  };

  const selectAllWorks = () => {
    setSelectedWorkIds(new Set(filteredWorks.map((work) => work.id)));
  };

  const clearSelection = () => {
    setSelectedWorkIds(new Set());
  };

  const handleBatchUpdate = async (updates: any) => {
    try {
      const selectedWorks = works.filter((work) =>
        selectedWorkIds.has(work.id)
      );

      for (const work of selectedWorks) {
        await updateWork(work.id, updates);
      }

      // 清除選擇並退出批量模式
      setSelectedWorkIds(new Set());
      setIsBatchMode(false);
      setShowBatchEditModal(false);
    } catch (error) {
      console.error("批量更新失敗:", error);
      alert("批量更新失敗，請檢查控制台錯誤信息");
    }
  };

  const handleBatchDelete = async () => {
    try {
      const selectedWorks = works.filter((work) =>
        selectedWorkIds.has(work.id)
      );

      for (const work of selectedWorks) {
        await deleteWork(work.id);
      }

      // 清除選擇並退出批量模式
      setSelectedWorkIds(new Set());
      setIsBatchMode(false);
      setShowBatchDeleteModal(false);
    } catch (error) {
      console.error("批量刪除失敗:", error);
      alert("批量刪除失敗，請檢查控制台錯誤信息");
    }
  };

  const selectedWorks = works.filter((work) => selectedWorkIds.has(work.id));

  // 獲取可用的篩選選項
  const availableTypes = Array.from(new Set(works.map((w) => w.type)));
  const availableStatuses = Array.from(new Set(works.map((w) => w.status)));
  const availableYears = Array.from(
    new Set(
      works
        .map((w) => w.year)
        .filter((year): year is number => year !== undefined)
    )
  ).sort((a, b) => b - a);

  // 獲取所有標籤
  const allTags = Array.from(
    new Set(
      works.flatMap((w) => w.tags || []).map((tag) => JSON.stringify(tag))
    )
  ).map((tagStr) => JSON.parse(tagStr));

  const getStatusColor = (status: string) => {
    switch (status) {
      case "進行中":
        return "bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200";
      case "已完結":
        return "bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200";
      case "暫停":
        return "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200";
      case "放棄":
        return "bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200";
      default:
        return "badge-unselected";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "動畫":
        return "bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-200";
      case "電影":
        return "bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200";
      case "電視劇":
        return "bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200";
      case "小說":
        return "bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200";
      case "漫畫":
        return "bg-orange-100 dark:bg-orange-900/20 text-orange-800 dark:text-orange-200";
      case "遊戲":
        return "bg-pink-100 dark:bg-pink-900/20 text-pink-800 dark:text-pink-200";
      default:
        return "badge-unselected";
    }
  };

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
    <div className="container mx-auto p-4 sm:p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <Logo />

        {/* 桌面端按鈕 */}
        <div className="hidden md:flex items-center space-x-2">
          <ThemeToggle />
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAniListSearch(true)}
          >
            <Search className="w-4 h-4 mr-1" />
            搜尋動畫
          </Button>
          <Link href={getFullPath("/settings")}>
            <Button variant="outline" size="sm">
              <Settings className="w-4 h-4 mr-1" />
              設定
            </Button>
          </Link>
          <Link href={getFullPath("/works/new")}>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              新增作品
            </Button>
          </Link>
        </div>

        {/* 移動端選單按鈕 */}
        <div className="md:hidden">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowMobileMenu(!showMobileMenu)}
          >
            <Menu className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* 移動端選單 */}
      {showMobileMenu && (
        <div className="md:hidden mb-4 p-4 bg-white dark:bg-gray-800 rounded-lg border shadow-lg">
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

      {/* 統計卡片 */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">
                總作品數
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg sm:text-2xl font-bold text-foreground/90 dark:text-foreground/98">
                {stats.total_works}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">
                進行中
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg sm:text-2xl font-bold text-foreground/90 dark:text-foreground/98">
                {stats.status_stats["進行中"] || 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">
                已完結
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg sm:text-2xl font-bold text-foreground/90 dark:text-foreground/98">
                {stats.status_stats["已完結"] || 0}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 資料提醒 */}
      {showDataReminder && (
        <Card className="mb-6 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-medium text-yellow-800 dark:text-yellow-200">
                    重要提醒
                  </h3>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                    您的資料僅儲存在本地設備中。清除瀏覽器資料會導致資料遺失，建議定期備份。
                  </p>
                  <div className="flex items-center space-x-2 mt-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setShowDataReminder(false);
                        localStorage.setItem(
                          "watchedit_data_reminder_dismissed",
                          "true"
                        );
                      }}
                      className="text-yellow-600 dark:text-yellow-400"
                    >
                      不再提醒
                    </Button>
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowDataReminder(false);
                  localStorage.setItem(
                    "watchedit_data_reminder_dismissed",
                    "true"
                  );
                }}
                className="text-yellow-600 dark:text-yellow-400"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 搜尋和篩選 */}
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

      {/* 數據遷移提示 */}
      {migrationStatus?.needsMigration && (
        <div className="bg-yellow-100 dark:bg-yellow-900/20 border border-yellow-400 dark:border-yellow-800 text-yellow-700 dark:text-yellow-200 px-4 py-3 rounded mb-6 flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0">
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

      {/* 作品列表 */}
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
              ratingRange.max !== 5 ||
              progressFilter
                ? "搜尋結果"
                : "最近作品"}
            </h2>

            {/* 批量操作按鈕 */}
            {filteredWorks.length > 0 && (
              <div className="flex items-center space-x-2">
                <Button
                  variant={isBatchMode ? "default" : "outline"}
                  size="sm"
                  onClick={toggleBatchMode}
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
                      onClick={selectAllWorks}
                    >
                      全選
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={clearSelection}
                    >
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

        {filteredWorks.length === 0 ? (
          <div className="text-center py-8 empty-state">
            {works.length === 0
              ? "還沒有作品，開始新增你的第一個作品吧！"
              : "沒有找到符合條件的作品"}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {filteredWorks.slice(0, 6).map((work) => {
              const episodes = work.episodes || [];
              const watchedCount = episodes.filter((ep) => ep.watched).length;
              const totalEpisodes = episodes.length;
              const isSelected = selectedWorkIds.has(work.id);

              return (
                <Card
                  key={work.id}
                  className={`hover:shadow-lg transition-shadow ${
                    isBatchMode ? "cursor-pointer" : "cursor-pointer"
                  } ${
                    isSelected
                      ? "ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20"
                      : ""
                  }`}
                  onClick={() => {
                    if (isBatchMode) {
                      toggleWorkSelection(work.id);
                    } else {
                      window.location.href = getFullPath(
                        `/works/detail?id=${work.id}`
                      );
                    }
                  }}
                >
                  <CardHeader className="pb-3">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between space-y-2 sm:space-y-0">
                      <div className="flex items-start space-x-2 flex-1">
                        {isBatchMode && (
                          <div className="flex items-center mt-1">
                            {isSelected ? (
                              <CheckSquare className="w-4 h-4 text-blue-500" />
                            ) : (
                              <Square className="w-4 h-4 text-gray-400" />
                            )}
                          </div>
                        )}
                        <CardTitle className="text-base sm:text-lg line-clamp-2 flex-1">
                          {work.title}
                        </CardTitle>
                      </div>
                      <div className="flex items-center space-x-2">
                        {!isBatchMode && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleQuickAddEpisode(
                                work.id,
                                work.title,
                                work.type
                              );
                            }}
                            className="text-xs sm:text-sm"
                          >
                            <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                            <span className="hidden sm:inline">新增集數</span>
                            <span className="sm:hidden">新增</span>
                          </Button>
                        )}
                        {!isBatchMode && (
                          <ArrowRight className="w-4 h-4 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300" />
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Badge
                        variant={
                          work.status === "已完結"
                            ? "default"
                            : work.status === "進行中"
                            ? "secondary"
                            : "outline"
                        }
                        className={getStatusColor(work.status)}
                      >
                        {work.status}
                      </Badge>
                      <Badge className={getTypeColor(work.type)}>
                        {work.type}
                      </Badge>
                    </div>

                    {work.rating && (
                      <div className="flex items-center justify-end">
                        <Star className="w-4 h-4 star-icon mr-1" />
                        <span className="text-sm">{work.rating}/5</span>
                      </div>
                    )}

                    {work.review && (
                      <p className="text-xs description-text line-clamp-2">
                        {work.review}
                      </p>
                    )}

                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-3 h-3" />
                        <span className="note-text">
                          {work.year || "未知年份"}
                        </span>
                      </div>
                      {totalEpisodes > 0 && (
                        <div className="flex items-center space-x-1">
                          <Play className="w-3 h-3" />
                          <span className="note-text">
                            {watchedCount}/{totalEpisodes}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex flex-wrap items-center space-x-2 text-xs sm:text-sm description-text">
                        {work.tags?.map((tag) => (
                          <Badge key={tag.id} className="text-xs">
                            {tag.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* 查看更多按鈕 */}
        {filteredWorks.length > 6 && (
          <div className="text-center">
            <Button variant="outline">
              查看更多作品
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        )}
      </div>

      {/* 快速新增集數對話框 */}
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
          onClose={handleQuickAddClose}
        />
      )}

      {/* AniList 搜尋對話框 */}
      <AniListSearch
        onSelectAnime={handleAniListSelect}
        onClose={() => setShowAniListSearch(false)}
        isOpen={showAniListSearch}
      />

      {/* 雲端同步狀態 */}
      <CloudSyncStatus />

      {/* 批量編輯對話框 */}
      <BatchEditModal
        isOpen={showBatchEditModal}
        onClose={() => setShowBatchEditModal(false)}
        selectedWorks={selectedWorks}
        allTags={allTags}
        onBatchUpdate={handleBatchUpdate}
      />

      {/* 批量刪除對話框 */}
      <BatchDeleteModal
        isOpen={showBatchDeleteModal}
        onClose={() => setShowBatchDeleteModal(false)}
        selectedWorks={selectedWorks}
        onBatchDelete={handleBatchDelete}
      />
    </div>
  );
}
