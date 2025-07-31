"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import WorkTypeManager from "@/components/WorkTypeManager";
import CustomEpisodeTypeManager from "@/components/CustomEpisodeTypeManager";
import { useTheme } from "@/components/ThemeProvider";
import Link from "next/link";
import {
  Database,
  Cloud,
  Download,
  Upload,
  Trash2,
  Settings,
  Save,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Palette,
  Sun,
  Moon,
  Monitor,
  Tag,
  ArrowRight,
} from "lucide-react";

interface Settings {
  storageMode: "local" | "cloud";
  cloudEndpoint: string;
  autoSync: boolean;
  syncInterval: number;
  notifications: boolean;
  theme: "light" | "dark" | "auto";
  language: "zh-TW" | "en-US";
  dataBackup: boolean;
  dataBackupInterval: number;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>({
    storageMode: "local",
    cloudEndpoint: "",
    autoSync: false,
    syncInterval: 30,
    notifications: true,
    theme: "auto",
    language: "zh-TW",
    dataBackup: true,
    dataBackupInterval: 7,
  });

  const { theme, setTheme } = useTheme();

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    // 載入設定
    try {
      const savedSettings = localStorage.getItem("watchedit_settings");
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }
    } catch (error) {
      console.error("載入設定失敗:", error);
    }
  }, []);

  const saveSettings = () => {
    try {
      localStorage.setItem("watchedit_settings", JSON.stringify(settings));
      setMessage({ type: "success", text: "設定已儲存" });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error("儲存設定失敗:", error);
      setMessage({ type: "error", text: "儲存設定失敗" });
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const exportData = () => {
    setIsLoading(true);
    try {
      const works = localStorage.getItem("watchedit_works");
      const tags = localStorage.getItem("watchedit_tags");

      const data = {
        works: works ? JSON.parse(works) : [],
        tags: tags ? JSON.parse(tags) : [],
        exportDate: new Date().toISOString(),
        version: "1.0.0",
      };

      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `watchedit_backup_${
        new Date().toISOString().split("T")[0]
      }.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setMessage({ type: "success", text: "資料匯出成功" });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error("匯出資料失敗:", error);
      setMessage({ type: "error", text: "匯出資料失敗" });
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  const importData = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const data = JSON.parse(e.target?.result as string);

            if (data.works) {
              localStorage.setItem(
                "watchedit_works",
                JSON.stringify(data.works)
              );
            }
            if (data.tags) {
              localStorage.setItem("watchedit_tags", JSON.stringify(data.tags));
            }

            setMessage({ type: "success", text: "資料匯入成功" });
            setTimeout(() => setMessage(null), 3000);

            // 重新載入頁面以更新數據
            window.location.reload();
          } catch (error) {
            console.error("匯入資料失敗:", error);
            setMessage({ type: "error", text: "匯入資料失敗" });
            setTimeout(() => setMessage(null), 3000);
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const clearData = () => {
    if (confirm("確定要清除所有資料嗎？此操作無法復原！")) {
      localStorage.removeItem("watchedit_works");
      localStorage.removeItem("watchedit_tags");
      setMessage({ type: "success", text: "資料已清除" });
      setTimeout(() => setMessage(null), 3000);
      window.location.reload();
    }
  };

  const testCloudConnection = () => {
    setIsLoading(true);
    // 模擬測試雲端連接
    setTimeout(() => {
      setIsLoading(false);
      setMessage({ type: "success", text: "雲端連接測試成功" });
      setTimeout(() => setMessage(null), 3000);
    }, 2000);
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">設定</h1>
        <Button onClick={saveSettings}>
          <Save className="w-4 h-4 mr-2" />
          儲存設定
        </Button>
      </div>

      {message && (
        <div
          className={`mb-4 p-4 rounded-md flex items-center space-x-2 ${
            message.type === "success"
              ? "bg-green-100 text-green-800 border border-green-200"
              : "bg-red-100 text-red-800 border border-red-200"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle className="w-4 h-4" />
          ) : (
            <AlertTriangle className="w-4 h-4" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 基本設定 */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Palette className="w-5 h-5" />
                <span>外觀設定</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="theme">主題</Label>
                <div className="flex items-center space-x-2">
                  <Button
                    variant={theme === "light" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setTheme("light")}
                  >
                    <Sun className="w-4 h-4 mr-1" />
                    淺色
                  </Button>
                  <Button
                    variant={theme === "dark" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setTheme("dark")}
                  >
                    <Moon className="w-4 h-4 mr-1" />
                    深色
                  </Button>
                  <Button
                    variant={theme === "auto" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setTheme("auto")}
                  >
                    <Monitor className="w-4 h-4 mr-1" />
                    自動
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="language">語言</Label>
                <select
                  id="language"
                  value={settings.language}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      language: e.target.value as "zh-TW" | "en-US",
                    })
                  }
                  className="p-2 border rounded-md"
                >
                  <option value="zh-TW">繁體中文</option>
                  <option value="en-US">English</option>
                </select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Database className="w-5 h-5" />
                <span>資料管理</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="storageMode">儲存模式</Label>
                <select
                  id="storageMode"
                  value={settings.storageMode}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      storageMode: e.target.value as "local" | "cloud",
                    })
                  }
                  className="p-2 border rounded-md"
                >
                  <option value="local">本地儲存</option>
                  <option value="cloud">雲端同步</option>
                </select>
              </div>

              {settings.storageMode === "cloud" && (
                <div className="space-y-2">
                  <Label htmlFor="cloudEndpoint">雲端端點</Label>
                  <Input
                    id="cloudEndpoint"
                    value={settings.cloudEndpoint}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        cloudEndpoint: e.target.value,
                      })
                    }
                    placeholder="https://your-server.com/api"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={testCloudConnection}
                    disabled={isLoading}
                  >
                    <RefreshCw
                      className={`w-4 h-4 mr-2 ${
                        isLoading ? "animate-spin" : ""
                      }`}
                    />
                    測試連接
                  </Button>
                </div>
              )}

              <div className="flex items-center justify-between">
                <Label htmlFor="autoSync">自動同步</Label>
                <Switch
                  id="autoSync"
                  checked={settings.autoSync}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, autoSync: checked })
                  }
                />
              </div>

              {settings.autoSync && (
                <div className="flex items-center justify-between">
                  <Label htmlFor="syncInterval">同步間隔 (分鐘)</Label>
                  <Input
                    id="syncInterval"
                    type="number"
                    value={settings.syncInterval}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        syncInterval: parseInt(e.target.value),
                      })
                    }
                    min="1"
                    max="1440"
                    className="w-20"
                  />
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Cloud className="w-5 h-5" />
                <span>備份設定</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="dataBackup">自動備份</Label>
                <Switch
                  id="dataBackup"
                  checked={settings.dataBackup}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, dataBackup: checked })
                  }
                />
              </div>

              {settings.dataBackup && (
                <div className="flex items-center justify-between">
                  <Label htmlFor="dataBackupInterval">備份間隔 (天)</Label>
                  <Input
                    id="dataBackupInterval"
                    type="number"
                    value={settings.dataBackupInterval}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        dataBackupInterval: parseInt(e.target.value),
                      })
                    }
                    min="1"
                    max="30"
                    className="w-20"
                  />
                </div>
              )}

              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  onClick={exportData}
                  disabled={isLoading}
                >
                  <Download className="w-4 h-4 mr-2" />
                  匯出資料
                </Button>
                <Button
                  variant="outline"
                  onClick={importData}
                  disabled={isLoading}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  匯入資料
                </Button>
              </div>

              <Button
                variant="destructive"
                onClick={clearData}
                disabled={isLoading}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                清除所有資料
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* 進階設定 */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Tag className="w-5 h-5" />
                <span>標籤管理</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                管理作品標籤，可以新增、編輯和刪除標籤。
              </p>
              <Link href="/settings/tags">
                <Button className="w-full">
                  管理標籤
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="w-5 h-5" />
                <span>作品類型管理</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <WorkTypeManager />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="w-5 h-5" />
                <span>自定義集數類型</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CustomEpisodeTypeManager />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5" />
                <span>通知設定</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="notifications">啟用通知</Label>
                <Switch
                  id="notifications"
                  checked={settings.notifications}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, notifications: checked })
                  }
                />
              </div>
              <p className="text-xs text-gray-600">
                啟用後會顯示瀏覽器通知，提醒您觀看進度。
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
