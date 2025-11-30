import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Info,
  Database,
  AlertTriangle,
  Download,
  Upload,
  Trash2,
  BookOpen,
  Shield,
  Clock,
  CheckCircle,
  X,
  Play,
} from "lucide-react";
import { useTranslations } from "next-intl";

interface HelpGuideProps {
  isOpen: boolean;
  onClose: () => void;
  stats?: {
    total_works: number;
    episode_stats: {
      total_episodes: number;
      watched_episodes: number;
      completion_rate: number;
    };
    status_stats: Record<string, number>;
  };
}

export default function HelpGuide({ isOpen, onClose, stats }: HelpGuideProps) {
  const [activeTab, setActiveTab] = useState<"guide" | "data" | "backup">(
    "guide"
  );
  const t = useTranslations("HelpGuide");
  const tt = (
    key: string,
    defaultMessage: string,
    values?: Record<string, any>
  ) => t(key, { defaultMessage, ...values });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold">
            {tt("title", "教學說明")}
          </h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex border-b">
          <button
            className={`flex-1 px-4 py-2 text-sm font-medium ${
              activeTab === "guide"
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("guide")}
          >
            <BookOpen className="w-4 h-4 inline mr-2" />
            {tt("tabs.guide", "使用教學")}
          </button>
          <button
            className={`flex-1 px-4 py-2 text-sm font-medium ${
              activeTab === "data"
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("data")}
          >
            <Database className="w-4 h-4 inline mr-2" />
            {tt("tabs.data", "資料管理")}
          </button>
          <button
            className={`flex-1 px-4 py-2 text-sm font-medium ${
              activeTab === "backup"
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("backup")}
          >
            <Upload className="w-4 h-4 inline mr-2" />
            {tt("tabs.backup", "備份資訊")}
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === "guide" && (
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Info className="w-5 h-5 text-blue-500 mt-0.5" />
                <div>
                  <h3 className="font-semibold">
                    {tt("guide.welcome.title", "歡迎使用 WatchedIt")}
                  </h3>
                  <p className="description-container mt-1">
                    {tt(
                      "guide.welcome.description",
                      "這是一個簡單的個人作品管理工具，幫助您記錄看過的動畫、電影、電視劇等作品。"
                    )}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium">
                  {tt("guide.features.title", "主要功能：")}
                </h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>
                      {tt("guide.features.manageWorks", "新增和管理作品")}
                    </span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>
                      {tt("guide.features.trackProgress", "記錄觀看進度")}
                    </span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>
                      {tt(
                        "guide.features.anilistSearch",
                        "搜尋 AniList 資料庫"
                      )}
                    </span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>
                      {tt("guide.features.tagManagement", "標籤分類管理")}
                    </span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>{tt("guide.features.analytics", "統計分析")}</span>
                  </li>
                </ul>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium">
                  {tt("guide.quickStart.title", "快速開始：")}
                </h4>
                <ol className="space-y-2 text-sm list-decimal list-inside">
                  <li>{tt("guide.quickStart.step1", "點擊「新增作品」或「搜尋動畫」")}</li>
                  <li>{tt("guide.quickStart.step2", "填寫作品資訊或從 AniList 匯入")}</li>
                  <li>{tt("guide.quickStart.step3", "記錄觀看進度和集數")}</li>
                  <li>{tt("guide.quickStart.step4", "使用標籤進行分類")}</li>
                  <li>{tt("guide.quickStart.step5", "定期備份您的資料")}</li>
                </ol>
              </div>
            </div>
          )}

          {activeTab === "data" && (
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5" />
                <div>
                  <h3 className="font-semibold">
                    {tt("data.notice.title", "重要提醒")}
                  </h3>
                  <p className="description-container mt-1">
                    {tt(
                      "data.notice.description",
                      "您的資料僅儲存在本地設備中，不會上傳到任何伺服器。"
                    )}
                  </p>
                </div>
              </div>

              <Card className="bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center space-x-2">
                    <Shield className="w-4 h-4" />
                    <span>{tt("data.storage.title", "資料儲存說明")}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm space-y-2">
                  <p>{tt("data.storage.item1", "• 所有資料儲存在您的瀏覽器本地")}</p>
                  <p>{tt("data.storage.item2", "• 清除瀏覽器資料會導致資料遺失")}</p>
                  <p>{tt("data.storage.item3", "• 建議定期備份重要資料")}</p>
                  <p>{tt("data.storage.item4", "• 不同設備間資料不會自動同步")}</p>
                </CardContent>
              </Card>

              <div className="space-y-3">
                <h4 className="font-medium">
                  {tt("data.cleanup.title", "資料清理：")}
                </h4>
                <div className="text-sm space-y-2">
                  <p>{tt("data.cleanup.description", "以下情況會導致資料被清除：")}</p>
                  <ul className="list-disc list-inside space-y-1 list-text">
                    <li>{tt("data.cleanup.item1", "清除瀏覽器快取和資料")}</li>
                    <li>{tt("data.cleanup.item2", "使用無痕模式瀏覽")}</li>
                    <li>{tt("data.cleanup.item3", "重新安裝瀏覽器")}</li>
                    <li>{tt("data.cleanup.item4", "更換設備")}</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeTab === "backup" && (
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Database className="w-5 h-5 text-blue-500 mt-0.5" />
                <div>
                  <h3 className="font-semibold">
                    {tt("backup.title", "備份資訊")}
                  </h3>
                  <p className="description-container mt-1">
                    {tt("backup.description", "查看您的資料統計和備份選項。")}
                  </p>
                </div>
              </div>

              {stats && (
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-2">
                        <BookOpen className="w-4 h-4 text-blue-500" />
                        <span className="text-sm font-medium">
                          {tt("backup.cards.totalWorks", "作品總數")}
                        </span>
                      </div>
                      <div className="text-2xl font-bold mt-1">
                        {stats.total_works}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-2">
                        <Play className="w-4 h-4 text-green-500" />
                        <span className="text-sm font-medium">
                          {tt("backup.cards.totalEpisodes", "集數總數")}
                        </span>
                      </div>
                      <div className="text-2xl font-bold mt-1">
                        {stats.episode_stats.total_episodes}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              <div className="space-y-3">
                <h4 className="font-medium">
                  {tt("backup.options.title", "備份選項：")}
                </h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Download className="w-4 h-4 text-blue-500" />
                      <span className="text-sm">
                        {tt("backup.options.export", "匯出資料")}
                      </span>
                    </div>
                    <Badge variant="outline">
                      {tt("backup.options.exportFormat", "JSON 格式")}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Upload className="w-4 h-4 text-green-500" />
                      <span className="text-sm">
                        {tt("backup.options.import", "匯入資料")}
                      </span>
                    </div>
                    <Badge variant="outline">
                      {tt("backup.options.importSupport", "支援備份")}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium">
                  {tt("backup.tips.title", "備份建議：")}
                </h4>
                <ul className="text-sm space-y-1 list-text">
                  <li>{tt("backup.tips.item1", "• 每週備份一次重要資料")}</li>
                  <li>{tt("backup.tips.item2", "• 將備份檔案儲存在安全位置")}</li>
                  <li>{tt("backup.tips.item3", "• 更換設備前務必備份")}</li>
                  <li>{tt("backup.tips.item4", "• 定期檢查備份檔案完整性")}</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t">
          <Button onClick={onClose}>
            {tt("actions.close", "關閉")}
          </Button>
        </div>
      </div>
    </div>
  );
}
