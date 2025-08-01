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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold">教學說明</h2>
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
            使用教學
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
            資料管理
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
            備份資訊
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === "guide" && (
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Info className="w-5 h-5 text-blue-500 mt-0.5" />
                <div>
                  <h3 className="font-semibold">歡迎使用 WatchedIt</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    這是一個簡單的個人作品管理工具，幫助您記錄看過的動畫、電影、電視劇等作品。
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium">主要功能：</h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>新增和管理作品</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>記錄觀看進度</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>搜尋 AniList 資料庫</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>標籤分類管理</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>統計分析</span>
                  </li>
                </ul>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium">快速開始：</h4>
                <ol className="space-y-2 text-sm list-decimal list-inside">
                  <li>點擊「新增作品」或「搜尋動畫」</li>
                  <li>填寫作品資訊或從 AniList 匯入</li>
                  <li>記錄觀看進度和集數</li>
                  <li>使用標籤進行分類</li>
                  <li>定期備份您的資料</li>
                </ol>
              </div>
            </div>
          )}

          {activeTab === "data" && (
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5" />
                <div>
                  <h3 className="font-semibold">重要提醒</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    您的資料僅儲存在本地設備中，不會上傳到任何伺服器。
                  </p>
                </div>
              </div>

              <Card className="bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center space-x-2">
                    <Shield className="w-4 h-4" />
                    <span>資料儲存說明</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm space-y-2">
                  <p>• 所有資料儲存在您的瀏覽器本地</p>
                  <p>• 清除瀏覽器資料會導致資料遺失</p>
                  <p>• 建議定期備份重要資料</p>
                  <p>• 不同設備間資料不會自動同步</p>
                </CardContent>
              </Card>

              <div className="space-y-3">
                <h4 className="font-medium">資料清理：</h4>
                <div className="text-sm space-y-2">
                  <p>以下情況會導致資料被清除：</p>
                  <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-400">
                    <li>清除瀏覽器快取和資料</li>
                    <li>使用無痕模式瀏覽</li>
                    <li>重新安裝瀏覽器</li>
                    <li>更換設備</li>
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
                  <h3 className="font-semibold">備份資訊</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    查看您的資料統計和備份選項。
                  </p>
                </div>
              </div>

              {stats && (
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-2">
                        <BookOpen className="w-4 h-4 text-blue-500" />
                        <span className="text-sm font-medium">作品總數</span>
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
                        <span className="text-sm font-medium">集數總數</span>
                      </div>
                      <div className="text-2xl font-bold mt-1">
                        {stats.episode_stats.total_episodes}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              <div className="space-y-3">
                <h4 className="font-medium">備份選項：</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Download className="w-4 h-4 text-blue-500" />
                      <span className="text-sm">匯出資料</span>
                    </div>
                    <Badge variant="outline">JSON 格式</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Upload className="w-4 h-4 text-green-500" />
                      <span className="text-sm">匯入資料</span>
                    </div>
                    <Badge variant="outline">支援備份</Badge>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium">備份建議：</h4>
                <ul className="text-sm space-y-1 text-gray-600 dark:text-gray-400">
                  <li>• 每週備份一次重要資料</li>
                  <li>• 將備份檔案儲存在安全位置</li>
                  <li>• 更換設備前務必備份</li>
                  <li>• 定期檢查備份檔案完整性</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t">
          <Button onClick={onClose}>關閉</Button>
        </div>
      </div>
    </div>
  );
}
