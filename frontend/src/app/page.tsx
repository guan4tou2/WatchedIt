"use client";

import { useEffect, useState } from "react";
import { useWorkStore } from "@/store/useWorkStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import PlatformInfo from "@/components/PlatformInfo";
import Logo from "@/components/Logo";
import { pwaService } from "@/lib/pwa";
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
  Filter,
  X,
  Database,
  AlertTriangle,
  Menu,
} from "lucide-react";
import QuickAddEpisode from "@/components/QuickAddEpisode";
import AniListSearch from "@/components/AniListSearch";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Episode, WorkCreate } from "@/types";
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
  const [showFilters, setShowFilters] = useState(false);

  // 遷移狀態
  const [migrationStatus, setMigrationStatus] = useState<{
    needsMigration: boolean;
    hasLocalData: boolean;
    hasIndexedDBData: boolean;
  } | null>(null);
  const [isMigrating, setIsMigrating] = useState(false);

  // 移動端選單狀態
  const [showMobileMenu, setShowMobileMenu] = useState(false);

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
      if (!matchesTitle && !matchesReview && !matchesNote) return false;
    }

    // 類型篩選
    if (selectedType && work.type !== selectedType) return false;

    // 狀態篩選
    if (selectedStatus && work.status !== selectedStatus) return false;

    // 年份篩選
    if (selectedYear && work.year?.toString() !== selectedYear) return false;

    return true;
  });

  // 清除所有篩選
  const clearFilters = () => {
    setSearchTerm("");
    setSelectedType("");
    setSelectedStatus("");
    setSelectedYear("");
  };

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
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
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
          <Link href="/settings">
            <Button variant="outline" size="sm">
              <Settings className="w-4 h-4 mr-1" />
              設定
            </Button>
          </Link>
          <Link href="/works/new">
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
            <Link href="/settings">
              <Button variant="outline" size="sm" className="w-full">
                <Settings className="w-4 h-4 mr-1" />
                設定
              </Button>
            </Link>
            <Link href="/works/new">
              <Button className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                新增作品
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* 平台資訊 */}
      <PlatformInfo />

      {/* 統計卡片 */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
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
                動畫
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg sm:text-2xl font-bold text-foreground/90 dark:text-foreground/98">
                {stats.type_stats["動畫"] || 0}
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
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-500/80 dark:text-blue-400/90">
                  {stats.status_stats["已完結"] || 0}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  已完結
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 搜尋和篩選 */}
      <div className="mb-6 space-y-4">
        {/* 搜尋欄 */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4" />
            <Input
              placeholder="搜尋作品標題、評論或備註..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="flex-1 sm:flex-none"
            >
              <Filter className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">篩選</span>
            </Button>
            {(searchTerm || selectedType || selectedStatus || selectedYear) && (
              <Button variant="outline" size="sm" onClick={clearFilters}>
                <X className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">清除</span>
              </Button>
            )}
          </div>
        </div>

        {/* 篩選選項 */}
        {showFilters && (
          <Card>
            <CardContent className="pt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* 類型篩選 */}
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    類型
                  </label>
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="w-full mt-1 p-2 border border-input/60 rounded-md text-sm bg-background/95 dark:text-foreground/95"
                  >
                    <option value="">全部類型</option>
                    {availableTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 狀態篩選 */}
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    狀態
                  </label>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="w-full mt-1 p-2 border border-input/60 rounded-md text-sm bg-background/95 dark:text-foreground/95"
                  >
                    <option value="">全部狀態</option>
                    {availableStatuses.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 年份篩選 */}
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    年份
                  </label>
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                    className="w-full mt-1 p-2 border rounded-md text-sm"
                  >
                    <option value="">全部年份</option>
                    {availableYears.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 快速操作 */}
                <div className="flex items-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearFilters}
                    className="w-full"
                  >
                    <X className="w-4 h-4 mr-2" />
                    清除篩選
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* 數據遷移提示 */}
      {migrationStatus?.needsMigration && (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-6 flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0">
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
          <h2 className="text-lg sm:text-xl font-semibold dark:text-foreground/98">
            {searchTerm || selectedType || selectedStatus || selectedYear
              ? "搜尋結果"
              : "最近作品"}
          </h2>
          {filteredWorks.length > 0 && (
            <div className="text-sm text-gray-600 dark:text-gray-400">
              共 {filteredWorks.length} 個作品
            </div>
          )}
        </div>

        {filteredWorks.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
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

              return (
                <Card
                  key={work.id}
                  className="hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => (window.location.href = `/works/${work.id}`)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between space-y-2 sm:space-y-0">
                      <CardTitle className="text-base sm:text-lg line-clamp-2">
                        {work.title}
                      </CardTitle>
                      <div className="flex items-center space-x-2">
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
                        <ArrowRight className="w-4 h-4 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300" />
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center space-x-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                      <span>{work.type}</span>
                      <span>•</span>
                      <span>{work.status}</span>
                      {work.year && (
                        <>
                          <span>•</span>
                          <span>{work.year}</span>
                        </>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    {/* 評分 */}
                    {work.rating && (
                      <div className="flex items-center space-x-1 mb-2">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <span
                              key={i}
                              className={`text-sm ${
                                i < work.rating!
                                  ? "text-yellow-500 dark:text-yellow-400"
                                  : "text-gray-300 dark:text-gray-600"
                              }`}
                            >
                              ★
                            </span>
                          ))}
                        </div>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {work.rating}/5
                        </span>
                      </div>
                    )}

                    {/* 集數進度 */}
                    {totalEpisodes > 0 && (
                      <div className="mb-2">
                        <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                          <span>集數進度</span>
                          <span>
                            {watchedCount}/{totalEpisodes}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div
                            className="bg-blue-600 dark:bg-blue-500 h-2 rounded-full transition-all duration-300"
                            style={{
                              width: `${(watchedCount / totalEpisodes) * 100}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    )}

                    {/* 標籤 */}
                    {work.tags && work.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {work.tags.slice(0, 3).map((tag) => (
                          <Badge
                            key={tag.id}
                            variant="secondary"
                            className="text-xs"
                            style={{
                              backgroundColor: `${tag.color}20`,
                              color: tag.color,
                            }}
                          >
                            {tag.name}
                          </Badge>
                        ))}
                        {work.tags.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{work.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}

                    {/* 評論預覽 */}
                    {work.review && (
                      <div className="mt-2">
                        <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                          {work.review}
                        </p>
                      </div>
                    )}
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
    </div>
  );
}
