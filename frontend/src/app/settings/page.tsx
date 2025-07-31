"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import WorkTypeManager from "@/components/WorkTypeManager";
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
      a.download = `watchedit-backup-${
        new Date().toISOString().split("T")[0]
      }.json`;
      a.click();
      URL.revokeObjectURL(url);

      setMessage({ type: "success", text: "資料匯出成功" });
    } catch (error) {
      console.error("匯出資料失敗:", error);
      setMessage({ type: "error", text: "資料匯出失敗" });
    }
    setIsLoading(false);
    setTimeout(() => setMessage(null), 3000);
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
          } catch (error) {
            setMessage({ type: "error", text: "資料匯入失敗" });
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const clearData = () => {
    if (confirm("確定要清除所有資料嗎？此操作無法復原。")) {
      try {
        localStorage.removeItem("watchedit_works");
        localStorage.removeItem("watchedit_tags");
        setMessage({ type: "success", text: "資料已清除" });
        setTimeout(() => setMessage(null), 3000);
      } catch (error) {
        console.error("清除資料失敗:", error);
        setMessage({ type: "error", text: "清除資料失敗" });
        setTimeout(() => setMessage(null), 3000);
      }
    }
  };

  const testCloudConnection = () => {
    setIsLoading(true);
    // 模擬雲端連接測試
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
        <Button onClick={saveSettings} disabled={isLoading}>
          <Save className="w-4 h-4 mr-2" />
          儲存設定
        </Button>
      </div>

      {message && (
        <div
          className={`mb-4 p-3 rounded-md flex items-center ${
            message.type === "success"
              ? "bg-green-100 text-green-800 border border-green-200"
              : "bg-red-100 text-red-800 border border-red-200"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle className="w-4 h-4 mr-2" />
          ) : (
            <AlertTriangle className="w-4 h-4 mr-2" />
          )}
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 儲存設定 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Database className="w-4 h-4 mr-2" />
              儲存設定
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-sm font-medium">儲存模式</Label>
              <div className="flex space-x-4 mt-2">
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="local"
                    name="storageMode"
                    value="local"
                    checked={settings.storageMode === "local"}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        storageMode: e.target.value as "local" | "cloud",
                      })
                    }
                  />
                  <Label htmlFor="local" className="flex items-center">
                    <Database className="w-4 h-4 mr-1" />
                    本地儲存
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="cloud"
                    name="storageMode"
                    value="cloud"
                    checked={settings.storageMode === "cloud"}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        storageMode: e.target.value as "local" | "cloud",
                      })
                    }
                  />
                  <Label htmlFor="cloud" className="flex items-center">
                    <Cloud className="w-4 h-4 mr-1" />
                    雲端儲存
                  </Label>
                </div>
              </div>
            </div>

            {settings.storageMode === "cloud" && (
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">雲端端點</Label>
                  <Input
                    value={settings.cloudEndpoint}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        cloudEndpoint: e.target.value,
                      })
                    }
                    placeholder="https://api.example.com"
                    className="mt-1"
                  />
                </div>
                <Button onClick={testCloudConnection} disabled={isLoading}>
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
              <div>
                <Label className="text-sm font-medium">自動同步</Label>
                <p className="text-xs text-gray-600">自動同步資料到雲端</p>
              </div>
              <Switch
                checked={settings.autoSync}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, autoSync: checked })
                }
              />
            </div>

            {settings.autoSync && (
              <div>
                <Label className="text-sm font-medium">同步間隔 (分鐘)</Label>
                <Input
                  type="number"
                  min="1"
                  max="1440"
                  value={settings.syncInterval}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      syncInterval: parseInt(e.target.value) || 30,
                    })
                  }
                  className="mt-1"
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* 資料管理 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings className="w-4 h-4 mr-2" />
              資料管理
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Button onClick={exportData} disabled={isLoading}>
                <Download className="w-4 h-4 mr-2" />
                匯出資料
              </Button>
              <Button
                onClick={importData}
                disabled={isLoading}
                variant="outline"
              >
                <Upload className="w-4 h-4 mr-2" />
                匯入資料
              </Button>
            </div>
            <Button
              onClick={clearData}
              disabled={isLoading}
              variant="destructive"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              清除所有資料
            </Button>
          </CardContent>
        </Card>

        {/* 應用程式設定 */}
        <Card>
          <CardHeader>
            <CardTitle>應用程式設定</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-sm font-medium">主題</Label>
              <select
                value={settings.theme}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    theme: e.target.value as "light" | "dark" | "auto",
                  })
                }
                className="w-full mt-1 p-2 border rounded-md"
              >
                <option value="auto">自動</option>
                <option value="light">淺色</option>
                <option value="dark">深色</option>
              </select>
            </div>

            <div>
              <Label className="text-sm font-medium">語言</Label>
              <select
                value={settings.language}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    language: e.target.value as "zh-TW" | "en-US",
                  })
                }
                className="w-full mt-1 p-2 border rounded-md"
              >
                <option value="zh-TW">繁體中文</option>
                <option value="en-US">English</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">通知</Label>
                <p className="text-xs text-gray-600">啟用推送通知</p>
              </div>
              <Switch
                checked={settings.notifications}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, notifications: checked })
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* 備份設定 */}
        <Card>
          <CardHeader>
            <CardTitle>備份設定</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">自動備份</Label>
                <p className="text-xs text-gray-600">定期備份資料</p>
              </div>
              <Switch
                checked={settings.dataBackup}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, dataBackup: checked })
                }
              />
            </div>

            {settings.dataBackup && (
              <div>
                <Label className="text-sm font-medium">備份間隔 (天)</Label>
                <Input
                  type="number"
                  min="1"
                  max="30"
                  value={settings.dataBackupInterval}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      dataBackupInterval: parseInt(e.target.value) || 7,
                    })
                  }
                  className="mt-1"
                />
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 作品類型管理 */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Palette className="w-4 h-4 mr-2" />
            作品類型管理
          </CardTitle>
        </CardHeader>
        <CardContent>
          <WorkTypeManager />
        </CardContent>
      </Card>

      {/* 系統資訊 */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>系統資訊</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="font-medium">版本:</span> 1.0.0
            </div>
            <div>
              <span className="font-medium">儲存模式:</span>{" "}
              <Badge
                variant={
                  settings.storageMode === "local" ? "default" : "secondary"
                }
              >
                {settings.storageMode === "local" ? "本地" : "雲端"}
              </Badge>
            </div>
            <div>
              <span className="font-medium">資料大小:</span>{" "}
              {(() => {
                try {
                  const works = localStorage.getItem("watchedit_works");
                  const tags = localStorage.getItem("watchedit_tags");
                  const size = (works?.length || 0) + (tags?.length || 0);
                  return `${size} 筆資料`;
                } catch (error) {
                  return "無法取得";
                }
              })()}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
