"use client";

import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Search,
  Filter,
  X,
  Clock,
  Plus,
  ChevronDown,
  ChevronUp,
  Star,
  Calendar,
  Tag as TagIcon,
  Play,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { Tag } from "@/types";

interface SearchFilterProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  selectedType: string;
  onTypeChange: (type: string) => void;
  selectedStatus: string;
  onStatusChange: (status: string) => void;
  selectedYear: string;
  onYearChange: (year: string) => void;
  selectedTags: Tag[];
  onTagsChange: (tags: Tag[]) => void;
  ratingRange: { min: number; max: number };
  onRatingChange: (range: { min: number; max: number }) => void;
  progressFilter: string;
  onProgressChange: (progress: string) => void;
  onClearFilters: () => void;
  availableTypes: string[];
  availableStatuses: string[];
  availableYears: number[];
  allTags: Tag[];
  works: any[];
}

export default function SearchFilter({
  searchTerm,
  onSearchChange,
  selectedType,
  onTypeChange,
  selectedStatus,
  onStatusChange,
  selectedYear,
  onYearChange,
  selectedTags,
  onTagsChange,
  ratingRange,
  onRatingChange,
  progressFilter,
  onProgressChange,
  onClearFilters,
  availableTypes,
  availableStatuses,
  availableYears,
  allTags,
  works,
}: SearchFilterProps) {
  const [showFilters, setShowFilters] = useState(false);
  const [showSearchSuggestions, setShowSearchSuggestions] = useState(false);
  const [showSearchHistory, setShowSearchHistory] = useState(false);
  const [showTagSelector, setShowTagSelector] = useState(false);
  const tagSelectorRef = useRef<HTMLDivElement>(null);
  const [searchHistory, setSearchHistory] = useState<string[]>(() => {
    if (typeof window !== "undefined") {
      const history = localStorage.getItem("watchedit_search_history");
      return history ? JSON.parse(history) : [];
    }
    return [];
  });

  // 點擊外部收起來標籤選擇器
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        tagSelectorRef.current &&
        !tagSelectorRef.current.contains(event.target as Node)
      ) {
        setShowTagSelector(false);
      }
    };

    if (showTagSelector) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showTagSelector]);

  // 保存搜尋歷史
  const saveSearchHistory = (term: string) => {
    if (!term.trim()) return;

    const newHistory = [
      term,
      ...searchHistory.filter((item) => item !== term),
    ].slice(0, 10);
    setSearchHistory(newHistory);
    localStorage.setItem(
      "watchedit_search_history",
      JSON.stringify(newHistory)
    );
  };

  // 清除搜尋歷史
  const clearSearchHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem("watchedit_search_history");
  };

  // 搜尋建議
  const searchSuggestions = () => {
    if (!searchTerm) return [];

    const suggestions = new Set<string>();

    // 從作品標題中找建議
    works.forEach((work) => {
      if (work.title.toLowerCase().includes(searchTerm.toLowerCase())) {
        suggestions.add(work.title);
      }
    });

    // 從標籤中找建議
    allTags.forEach((tag) => {
      if (tag.name.toLowerCase().includes(searchTerm.toLowerCase())) {
        suggestions.add(tag.name);
      }
    });

    return Array.from(suggestions).slice(0, 5);
  };

  const hasActiveFilters =
    searchTerm ||
    selectedType ||
    selectedStatus ||
    selectedYear ||
    selectedTags.length > 0 ||
    ratingRange.min !== 0 ||
    ratingRange.max !== 5 ||
    progressFilter;

  // 快速篩選選項
  const quickFilters = [
    {
      label: "全部",
      action: () => onClearFilters(),
      icon: null,
      color:
        "bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700",
    },
    {
      label: "進行中",
      action: () => onStatusChange("進行中"),
      icon: Play,
      color:
        "bg-blue-100 dark:bg-blue-900/20 hover:bg-blue-200 dark:hover:bg-blue-900/30 text-blue-800 dark:text-blue-200",
    },
    {
      label: "已完結",
      action: () => onStatusChange("已完結"),
      icon: CheckCircle,
      color:
        "bg-green-100 dark:bg-green-900/20 hover:bg-green-200 dark:hover:bg-green-900/30 text-green-800 dark:text-green-200",
    },
    {
      label: "動畫",
      action: () => onTypeChange("動畫"),
      icon: null,
      color:
        "bg-purple-100 dark:bg-purple-900/20 hover:bg-purple-200 dark:hover:bg-purple-900/30 text-purple-800 dark:text-purple-200",
    },
    {
      label: "電影",
      action: () => onTypeChange("電影"),
      icon: null,
      color:
        "bg-red-100 dark:bg-red-900/20 hover:bg-red-200 dark:hover:bg-red-900/30 text-red-800 dark:text-red-200",
    },
    {
      label: "高評分",
      action: () => onRatingChange({ min: 4, max: 5 }),
      icon: Star,
      color:
        "bg-yellow-100 dark:bg-yellow-900/20 hover:bg-yellow-200 dark:hover:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200",
    },
    {
      label: "未開始",
      action: () => onProgressChange("未開始"),
      icon: AlertCircle,
      color:
        "bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700",
    },
    {
      label: "已完成",
      action: () => onProgressChange("已完成"),
      icon: CheckCircle,
      color:
        "bg-green-100 dark:bg-green-900/20 hover:bg-green-200 dark:hover:bg-green-900/30 text-green-800 dark:text-green-200",
    },
  ];

  return (
    <div className="space-y-4">
      {/* 主要搜尋區域 */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center space-y-3 lg:space-y-0 lg:space-x-4">
        {/* 搜尋欄 */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="搜尋作品標題、評論、備註或標籤..."
            value={searchTerm}
            onChange={(e) => {
              onSearchChange(e.target.value);
              setShowSearchSuggestions(e.target.value.length > 0);
            }}
            onFocus={() => {
              setShowSearchSuggestions(searchTerm.length > 0);
              setShowSearchHistory(searchHistory.length > 0);
            }}
            onBlur={() =>
              setTimeout(() => {
                setShowSearchSuggestions(false);
                setShowSearchHistory(false);
              }, 200)
            }
            onKeyDown={(e) => {
              if (e.key === "Enter" && searchTerm.trim()) {
                saveSearchHistory(searchTerm);
              }
            }}
            className="pl-10 h-11 text-base"
          />

          {/* 搜尋建議和歷史記錄 */}
          {(showSearchSuggestions || showSearchHistory) && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-20 max-h-64 overflow-y-auto">
              {/* 搜尋建議 */}
              {showSearchSuggestions && searchSuggestions().length > 0 && (
                <div>
                  <div className="px-4 py-2 text-xs font-medium text-gray-500 border-b border-gray-100 dark:border-gray-600 bg-gray-50 dark:bg-gray-700">
                    搜尋建議
                  </div>
                  {searchSuggestions().map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        onSearchChange(suggestion);
                        saveSearchHistory(suggestion);
                        setShowSearchSuggestions(false);
                        setShowSearchHistory(false);
                      }}
                      className="w-full text-left p-3 hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-600 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <span className="text-sm">{suggestion}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* 搜尋歷史 */}
              {showSearchHistory && searchHistory.length > 0 && (
                <div>
                  <div className="flex items-center justify-between px-4 py-2 text-xs font-medium text-gray-500 border-b border-gray-100 dark:border-gray-600 bg-gray-50 dark:bg-gray-700">
                    <span>搜尋歷史</span>
                    <button
                      onClick={clearSearchHistory}
                      className="text-red-500 hover:text-red-700 transition-colors"
                    >
                      清除
                    </button>
                  </div>
                  {searchHistory.map((term, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        onSearchChange(term);
                        setShowSearchSuggestions(false);
                        setShowSearchHistory(false);
                      }}
                      className="w-full text-left p-3 hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-600 last:border-b-0 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <Clock className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <span className="text-sm">{term}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* 操作按鈕 */}
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="flex-1 lg:flex-none h-11 px-4"
          >
            <Filter className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">篩選</span>
            {showFilters ? (
              <ChevronUp className="w-4 h-4 ml-2" />
            ) : (
              <ChevronDown className="w-4 h-4 ml-2" />
            )}
          </Button>
          {hasActiveFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={onClearFilters}
              className="h-11 px-4"
            >
              <X className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">清除</span>
            </Button>
          )}
        </div>
      </div>

      {/* 快速篩選標籤 */}
      <div className="flex flex-wrap gap-2">
        {quickFilters.map((filter) => {
          const Icon = filter.icon;
          return (
            <button
              key={filter.label}
              onClick={filter.action}
              className={`px-3 py-2 text-sm rounded-lg transition-all duration-200 ${filter.color} flex items-center space-x-2 hover:scale-105 active:scale-95`}
            >
              {Icon && <Icon className="w-4 h-4" />}
              <span>{filter.label}</span>
            </button>
          );
        })}
      </div>

      {/* 活動篩選顯示 */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
            活動篩選:
          </span>
          {searchTerm && (
            <Badge variant="secondary" className="bg-blue-100 dark:bg-blue-800">
              搜尋: {searchTerm}
            </Badge>
          )}
          {selectedType && (
            <Badge
              variant="secondary"
              className="bg-purple-100 dark:bg-purple-800"
            >
              類型: {selectedType}
            </Badge>
          )}
          {selectedStatus && (
            <Badge variant="secondary" className="bg-blue-100 dark:bg-blue-800">
              狀態: {selectedStatus}
            </Badge>
          )}
          {selectedYear && (
            <Badge
              variant="secondary"
              className="bg-green-100 dark:bg-green-800"
            >
              年份: {selectedYear}
            </Badge>
          )}
          {selectedTags.map((tag) => (
            <Badge
              key={tag.id}
              variant="secondary"
              className="bg-orange-100 dark:bg-orange-800"
            >
              標籤: {tag.name}
            </Badge>
          ))}
          {(ratingRange.min !== 0 || ratingRange.max !== 5) && (
            <Badge
              variant="secondary"
              className="bg-yellow-100 dark:bg-yellow-800"
            >
              評分: {ratingRange.min}-{ratingRange.max}
            </Badge>
          )}
          {progressFilter && (
            <Badge
              variant="secondary"
              className="bg-indigo-100 dark:bg-indigo-800"
            >
              進度: {progressFilter}
            </Badge>
          )}
        </div>
      )}

      {/* 詳細篩選選項 */}
      {showFilters && (
        <Card className="border-2 border-gray-200 dark:border-gray-700">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center space-x-2 text-lg">
              <Filter className="w-5 h-5" />
              <span>詳細篩選</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              {/* 基本篩選區域 */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center space-x-2">
                  <TagIcon className="w-4 h-4" />
                  <span>基本篩選</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* 類型篩選 */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      作品類型
                    </label>
                    <select
                      value={selectedType}
                      onChange={(e) => onTypeChange(e.target.value)}
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
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
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      觀看狀態
                    </label>
                    <select
                      value={selectedStatus}
                      onChange={(e) => onStatusChange(e.target.value)}
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
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
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      發行年份
                    </label>
                    <select
                      value={selectedYear}
                      onChange={(e) => onYearChange(e.target.value)}
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    >
                      <option value="">全部年份</option>
                      {availableYears.map((year) => (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* 進度篩選 */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      觀看進度
                    </label>
                    <select
                      value={progressFilter}
                      onChange={(e) => onProgressChange(e.target.value)}
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    >
                      <option value="">全部進度</option>
                      <option value="未開始">未開始</option>
                      <option value="進行中">進行中</option>
                      <option value="已完成">已完成</option>
                      <option value="高進度">高進度 (80%+)</option>
                      <option value="低進度">低進度 (20%+)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* 進階篩選區域 */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center space-x-2">
                  <Star className="w-4 h-4" />
                  <span>進階篩選</span>
                </h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* 評分篩選 */}
                  <div className="space-y-4">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      評分範圍
                    </label>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                        <span>{ratingRange.min} 分</span>
                        <span>{ratingRange.max} 分</span>
                      </div>
                      <div className="space-y-4">
                        <div className="flex items-center justify-center space-x-4">
                          <div className="flex items-center space-x-2">
                            <span className="text-xs text-gray-500">最小</span>
                            <input
                              type="range"
                              min="0"
                              max="5"
                              step="0.5"
                              value={ratingRange.min}
                              onChange={(e) =>
                                onRatingChange({
                                  ...ratingRange,
                                  min: parseFloat(e.target.value),
                                })
                              }
                              className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                            />
                          </div>
                          <div className="flex items-center space-x-2">
                            <input
                              type="range"
                              min="0"
                              max="5"
                              step="0.5"
                              value={ratingRange.max}
                              onChange={(e) =>
                                onRatingChange({
                                  ...ratingRange,
                                  max: parseFloat(e.target.value),
                                })
                              }
                              className="w-20 h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                            />
                            <span className="text-xs text-gray-500">最大</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-center space-x-2">
                          {[0, 1, 2, 3, 4, 5].map((rating) => (
                            <button
                              key={rating}
                              onClick={() =>
                                onRatingChange({ min: rating, max: rating })
                              }
                              className={`w-8 h-8 rounded-lg text-xs font-medium transition-all ${
                                ratingRange.min === rating &&
                                ratingRange.max === rating
                                  ? "bg-blue-500 text-white shadow-lg"
                                  : "bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
                              }`}
                            >
                              {rating}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 標籤篩選 */}
                  <div className="space-y-4">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      標籤篩選
                    </label>
                    <div className="space-y-3">
                      {/* 已選擇的標籤 */}
                      {selectedTags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {selectedTags.map((tag) => (
                            <Badge
                              key={tag.id}
                              className="flex items-center space-x-1 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200"
                            >
                              <span>{tag.name}</span>
                              <button
                                onClick={() =>
                                  onTagsChange(
                                    selectedTags.filter((t) => t.id !== tag.id)
                                  )
                                }
                                className="ml-1 hover:bg-blue-200 dark:hover:bg-blue-800 rounded-full p-0.5 transition-colors"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                      )}

                      {/* 標籤選擇器 */}
                      <div className="relative" ref={tagSelectorRef}>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setShowTagSelector(!showTagSelector)}
                          className="w-full justify-start p-3 h-auto"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          {selectedTags.length === 0
                            ? "選擇標籤"
                            : `已選擇 ${selectedTags.length} 個標籤`}
                          {showTagSelector ? (
                            <ChevronUp className="w-4 h-4 ml-auto" />
                          ) : (
                            <ChevronDown className="w-4 h-4 ml-auto" />
                          )}
                        </Button>

                        {showTagSelector && (
                          <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                            {allTags.length === 0 ? (
                              <div className="p-4 text-sm text-gray-500 text-center">
                                沒有可用的標籤
                              </div>
                            ) : (
                              <div className="p-2 space-y-1">
                                {allTags.map((tag) => (
                                  <button
                                    key={tag.id}
                                    onClick={() => {
                                      const isSelected = selectedTags.some(
                                        (t) => t.id === tag.id
                                      );
                                      if (isSelected) {
                                        onTagsChange(
                                          selectedTags.filter(
                                            (t) => t.id !== tag.id
                                          )
                                        );
                                      } else {
                                        onTagsChange([...selectedTags, tag]);
                                      }
                                    }}
                                    className={`w-full text-left p-3 rounded-lg flex items-center space-x-3 transition-all ${
                                      selectedTags.some((t) => t.id === tag.id)
                                        ? "bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800"
                                        : "hover:bg-gray-50 dark:hover:bg-gray-700"
                                    }`}
                                  >
                                    <div
                                      className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                                        selectedTags.some(
                                          (t) => t.id === tag.id
                                        )
                                          ? "bg-blue-500 border-blue-500"
                                          : "border-gray-300 dark:border-gray-600"
                                      }`}
                                    >
                                      {selectedTags.some(
                                        (t) => t.id === tag.id
                                      ) && (
                                        <CheckCircle className="w-3 h-3 text-white" />
                                      )}
                                    </div>
                                    <span className="text-sm">{tag.name}</span>
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 快速進度按鈕 */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center space-x-2">
                  <Play className="w-4 h-4" />
                  <span>快速進度篩選</span>
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    {
                      value: "未開始",
                      label: "未開始",
                      color:
                        "bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700",
                      icon: AlertCircle,
                    },
                    {
                      value: "進行中",
                      label: "進行中",
                      color:
                        "bg-blue-100 dark:bg-blue-900/20 hover:bg-blue-200 dark:hover:bg-blue-900/30",
                      icon: Play,
                    },
                    {
                      value: "已完成",
                      label: "已完成",
                      color:
                        "bg-green-100 dark:bg-green-900/20 hover:bg-green-200 dark:hover:bg-green-900/30",
                      icon: CheckCircle,
                    },
                    {
                      value: "高進度",
                      label: "高進度",
                      color:
                        "bg-purple-100 dark:bg-purple-900/20 hover:bg-purple-200 dark:hover:bg-purple-900/30",
                      icon: Star,
                    },
                  ].map((option) => {
                    const Icon = option.icon;
                    return (
                      <button
                        key={option.value}
                        onClick={() =>
                          onProgressChange(
                            progressFilter === option.value ? "" : option.value
                          )
                        }
                        className={`p-3 rounded-lg text-sm font-medium transition-all flex items-center justify-center space-x-2 ${
                          progressFilter === option.value
                            ? `${option.color} border-2 border-current`
                            : "bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{option.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* 清除篩選按鈕 */}
            <div className="flex justify-center pt-6 border-t border-gray-200 dark:border-gray-700 mt-8">
              <Button
                variant="outline"
                size="sm"
                onClick={onClearFilters}
                className="px-6 py-2"
              >
                <X className="w-4 h-4 mr-2" />
                清除所有篩選
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
