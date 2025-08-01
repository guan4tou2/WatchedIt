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
import PlatformInfo from "@/components/PlatformInfo";
import { useTheme } from "@/components/ThemeProvider";
import { useWorkStore } from "@/store/useWorkStore";
import { cloudStorage, CloudConfig } from "@/lib/cloudStorage";
import { dbUtils } from "@/lib/indexedDB";
import { pwaService } from "@/lib/pwa";
import Logo from "@/components/Logo";
import Link from "next/link";
import { getFullPath } from "@/lib/utils";
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
  Clock,
  ArrowLeft,
  Smartphone,
  Globe,
  Bell,
  Shield,
  Wifi,
  WifiOff,
} from "lucide-react";

interface Settings {
  storageMode: "local" | "cloud";
  cloudEndpoint: string;
  cloudApiKey: string;
  autoSync: boolean;
  syncInterval: number;
  notifications: boolean;
  theme: "light" | "dark" | "auto";
  language: "zh-TW" | "en-US";
  dataBackup: boolean;
  dataBackupInterval: number;
  pwaNotifications: boolean;
  pwaAutoUpdate: boolean;
  pwaOfflineMode: boolean;
}

export default function SettingsPage() {
  const { works, tags, updateWorks, updateTags } = useWorkStore();
  const [settings, setSettings] = useState<Settings>({
    storageMode: "local",
    cloudEndpoint: "",
    cloudApiKey: "",
    autoSync: false,
    syncInterval: 30,
    notifications: true,
    theme: "auto",
    language: "zh-TW",
    dataBackup: true,
    dataBackupInterval: 7,
    pwaNotifications: true,
    pwaAutoUpdate: true,
    pwaOfflineMode: true,
  });

  const { theme, setTheme, systemTheme } = useTheme();

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // PWA 相關狀態
  const [pwaInfo, setPwaInfo] = useState({
    isPWA: false,
    isMobile: false,
    isIOS: false,
    isAndroid: false,
    isDesktop: false,
    canInstall: false,
    isInstalled: false,
    notificationPermission: "default" as NotificationPermission,
  });

  useEffect(() => {
    // 載入設定
    try {
      if (typeof window !== "undefined") {
        const savedSettings = localStorage.getItem("watchedit_settings");
        if (savedSettings) {
          setSettings(JSON.parse(savedSettings));
        }
      }
    } catch (error) {
      console.error("載入設定失敗:", error);
    }

    // 初始化 PWA 信息
    updatePWAInfo();
  }, []);

  const updatePWAInfo = () => {
    if (typeof window !== "undefined") {
      const platformInfo = pwaService.getPlatformInfo();
      setPwaInfo({
        ...platformInfo,
        canInstall: false, // 將在 beforeinstallprompt 事件中更新
        isInstalled: platformInfo.isPWA,
        notificationPermission: Notification.permission,
      });
    }
  };

  const saveSettings = () => {
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem("watchedit_settings", JSON.stringify(settings));
      }

      // 如果切換到雲端模式，設定雲端配置
      if (settings.storageMode === "cloud" && settings.cloudEndpoint) {
        const cloudConfig: CloudConfig = {
          endpoint: settings.cloudEndpoint,
          apiKey: settings.cloudApiKey || undefined,
        };
        cloudStorage.setConfig(cloudConfig);
      }

      setMessage({ type: "success", text: "設定已儲存" });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error("儲存設定失敗:", error);
      setMessage({ type: "error", text: "儲存設定失敗" });
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const exportData = async () => {
    setIsLoading(true);
    try {
      const data = await dbUtils.exportData();
      const exportData = {
        ...data,
        exportDate: new Date().toISOString(),
        version: "1.0.0",
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
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
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = async (e) => {
          try {
            const data = JSON.parse(e.target?.result as string);

            if (data.works && data.tags) {
              await dbUtils.importData({ works: data.works, tags: data.tags });

              // 更新 store 狀態
              await updateWorks(data.works);
              await updateTags(data.tags);
            }

            setMessage({ type: "success", text: "資料匯入成功" });
            setTimeout(() => setMessage(null), 3000);
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

  const clearData = async () => {
    if (confirm("確定要清除所有資料嗎？此操作無法復原！")) {
      try {
        await dbUtils.clearAll();

        // 更新 store 狀態
        await updateWorks([]);
        await updateTags([]);

        setMessage({ type: "success", text: "資料已清除" });
        setTimeout(() => setMessage(null), 3000);
      } catch (error) {
        console.error("清除資料失敗:", error);
        setMessage({ type: "error", text: "清除資料失敗" });
        setTimeout(() => setMessage(null), 3000);
      }
    }
  };

  const testCloudConnection = async () => {
    if (!settings.cloudEndpoint) {
      setMessage({ type: "error", text: "請先輸入雲端端點" });
      setTimeout(() => setMessage(null), 3000);
      return;
    }

    setIsLoading(true);
    try {
      const result = await cloudStorage.testConnection(settings.cloudEndpoint);

      if (result.success) {
        // 測試成功時自動儲存設定
        const updatedSettings = {
          ...settings,
          storageMode: "cloud" as const,
        };
        setSettings(updatedSettings);

        // 設定雲端配置
        const cloudConfig: CloudConfig = {
          endpoint: settings.cloudEndpoint,
          apiKey: settings.cloudApiKey || undefined,
        };
        cloudStorage.setConfig(cloudConfig);

        // 儲存設定到 localStorage
        if (typeof window !== "undefined") {
          localStorage.setItem(
            "watchedit_settings",
            JSON.stringify(updatedSettings)
          );
        }

        setMessage({ type: "success", text: "連接測試成功，端點已自動儲存" });
      } else {
        setMessage({ type: "error", text: result.message });
      }
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({ type: "error", text: "連接測試失敗" });
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  const syncToCloud = async () => {
    if (!settings.cloudEndpoint) {
      setMessage({ type: "error", text: "請先設定雲端端點" });
      setTimeout(() => setMessage(null), 3000);
      return;
    }

    setIsLoading(true);
    try {
      // 使用 uploadData 直接上傳數據到雲端
      const result = await cloudStorage.uploadData(works, tags);

      if (result.success) {
        // 設定最後同步時間
        cloudStorage.setLastSyncTime();

        setMessage({ type: "success", text: "數據已成功上傳到雲端" });
      } else {
        setMessage({ type: "error", text: result.message });
      }
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({ type: "error", text: "同步失敗" });
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  const downloadFromCloud = async () => {
    if (!settings.cloudEndpoint) {
      setMessage({ type: "error", text: "請先設定雲端端點" });
      setTimeout(() => setMessage(null), 3000);
      return;
    }

    setIsLoading(true);
    try {
      const result = await cloudStorage.downloadData();

      if (result.success && result.data) {
        // 更新本地數據
        updateWorks(result.data.works);
        updateTags(result.data.tags);
        cloudStorage.setLastSyncTime();

        setMessage({ type: "success", text: result.message });
      } else {
        setMessage({ type: "error", text: result.message });
      }
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({ type: "error", text: "下載失敗" });
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  const getLastSyncTime = () => {
    const lastSync = cloudStorage.getLastSyncTime();
    if (!lastSync) return "從未同步";

    const date = new Date(lastSync);
    return date.toLocaleString("zh-TW");
  };

  const shouldSync = () => {
    return cloudStorage.shouldSync();
  };

  // PWA 相關功能
  const requestNotificationPermission = async () => {
    try {
      const permission = await pwaService.requestNotificationPermission();
      updatePWAInfo();

      if (permission) {
        setMessage({ type: "success", text: "通知權限已啟用" });
      } else {
        setMessage({ type: "error", text: "通知權限被拒絕" });
      }
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({ type: "error", text: "請求通知權限失敗" });
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const checkForUpdate = async () => {
    try {
      const hasUpdate = await pwaService.checkForUpdate();
      if (hasUpdate) {
        setMessage({ type: "success", text: "檢查更新完成" });
      } else {
        setMessage({ type: "error", text: "無法檢查更新" });
      }
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({ type: "error", text: "檢查更新失敗" });
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const getInstallInstructions = () => {
    if (pwaInfo.isIOS) {
      return "點擊 Safari 的分享按鈕，選擇「加入主畫面」";
    } else if (pwaInfo.isAndroid) {
      return "點擊瀏覽器選單，選擇「安裝應用程式」";
    } else {
      return "點擊瀏覽器地址欄旁的安裝圖示";
    }
  };

  return (
    <div className="container mx-auto p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 space-y-4 sm:space-y-0">
        <div className="flex items-center space-x-4">
          <Logo showText={false} />
          <h1 className="text-2xl sm:text-3xl font-bold">設定</h1>
        </div>
        <Button onClick={saveSettings} className="w-full sm:w-auto">
          <Save className="w-4 h-4 mr-2" />
          儲存設定
        </Button>
      </div>

      {message && (
        <div
          className={`mb-4 p-4 rounded-md flex items-center space-x-2 ${
            message.type === "success"
              ? "bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200 border border-green-200 dark:border-green-800"
              : "bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200 border border-red-200 dark:border-red-800"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle className="w-4 h-4" />
          ) : (
            <AlertTriangle className="w-4 h-4" />
          )}
          <span className="text-sm">{message.text}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
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

              {/* 系統主題信息 */}
              {theme === "auto" && (
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
                  <div className="flex items-center space-x-2 mb-2">
                    <Monitor className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                      自動模式
                    </span>
                  </div>
                  <div className="text-xs text-blue-600 dark:text-blue-300 space-y-1">
                    <div className="flex items-center justify-between">
                      <span>系統主題:</span>
                      <Badge variant="outline" className="text-xs">
                        {systemTheme === "dark" ? "深色" : "淺色"}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>當前應用:</span>
                      <Badge variant="default" className="text-xs">
                        {systemTheme === "dark" ? "深色" : "淺色"}
                      </Badge>
                    </div>
                    <p className="text-xs mt-2">系統主題變化時會自動切換</p>
                  </div>
                </div>
              )}

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
                  className="p-2 border rounded-md dark:text-foreground/95 dark:bg-background/95"
                >
                  <option value="zh-TW">繁體中文</option>
                  <option value="en-US">English</option>
                </select>
              </div>
            </CardContent>
          </Card>

          {/* PWA 設定 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Smartphone className="w-5 h-5" />
                <span>PWA 設定</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* PWA 狀態 */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">PWA 狀態</span>
                  <Badge variant={pwaInfo.isPWA ? "default" : "secondary"}>
                    {pwaInfo.isPWA ? "已安裝" : "未安裝"}
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">平台</span>
                  <Badge variant="outline">
                    {pwaInfo.isIOS
                      ? "iOS"
                      : pwaInfo.isAndroid
                      ? "Android"
                      : "桌面"}
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">通知權限</span>
                  <Badge
                    variant={
                      pwaInfo.notificationPermission === "granted"
                        ? "default"
                        : pwaInfo.notificationPermission === "denied"
                        ? "destructive"
                        : "secondary"
                    }
                  >
                    {pwaInfo.notificationPermission === "granted"
                      ? "已授權"
                      : pwaInfo.notificationPermission === "denied"
                      ? "已拒絕"
                      : "未設定"}
                  </Badge>
                </div>
              </div>

              {/* PWA 功能設定 */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="pwaNotifications">PWA 通知</Label>
                  <Switch
                    id="pwaNotifications"
                    checked={settings.pwaNotifications}
                    onCheckedChange={(checked) =>
                      setSettings({ ...settings, pwaNotifications: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="pwaAutoUpdate">自動更新</Label>
                  <Switch
                    id="pwaAutoUpdate"
                    checked={settings.pwaAutoUpdate}
                    onCheckedChange={(checked) =>
                      setSettings({ ...settings, pwaAutoUpdate: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="pwaOfflineMode">離線模式</Label>
                  <Switch
                    id="pwaOfflineMode"
                    checked={settings.pwaOfflineMode}
                    onCheckedChange={(checked) =>
                      setSettings({ ...settings, pwaOfflineMode: checked })
                    }
                  />
                </div>
              </div>

              {/* PWA 操作按鈕 */}
              <div className="space-y-2">
                {!pwaInfo.isPWA && (
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
                    <div className="flex items-center space-x-2 mb-2">
                      <Download className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                        安裝 PWA
                      </span>
                    </div>
                    <p className="text-xs text-blue-600 dark:text-blue-300 mb-2">
                      {getInstallInstructions()}
                    </p>
                  </div>
                )}

                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={requestNotificationPermission}
                    disabled={pwaInfo.notificationPermission === "granted"}
                  >
                    <Bell className="w-4 h-4 mr-2" />
                    請求通知權限
                  </Button>

                  <Button variant="outline" size="sm" onClick={checkForUpdate}>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    檢查更新
                  </Button>
                </div>

                <div className="flex items-center space-x-2 text-xs text-gray-600 dark:text-gray-400">
                  {pwaInfo.isPWA ? (
                    <>
                      <Globe className="w-4 h-4" />
                      <span>PWA 模式運行中</span>
                    </>
                  ) : (
                    <>
                      <Wifi className="w-4 h-4" />
                      <span>瀏覽器模式</span>
                    </>
                  )}
                </div>
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
                  className="p-2 border rounded-md dark:text-foreground/95 dark:bg-background/95"
                >
                  <option value="local">本地儲存</option>
                  <option value="cloud">雲端同步</option>
                </select>
              </div>

              {settings.storageMode === "cloud" && (
                <div className="space-y-4">
                  <div>
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
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="cloudApiKey">API 金鑰 (可選)</Label>
                    <Input
                      id="cloudApiKey"
                      type="password"
                      value={settings.cloudApiKey}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          cloudApiKey: e.target.value,
                        })
                      }
                      placeholder="輸入 API 金鑰"
                      className="mt-1"
                    />
                  </div>

                  <div className="flex space-x-2">
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

                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={syncToCloud}
                      disabled={isLoading}
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      同步到雲端
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={downloadFromCloud}
                      disabled={isLoading}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      從雲端下載
                    </Button>
                  </div>

                  <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4" />
                      <span>最後同步: {getLastSyncTime()}</span>
                    </div>
                    {shouldSync() && (
                      <div className="flex items-center space-x-2 text-orange-600 dark:text-orange-400">
                        <AlertTriangle className="w-4 h-4" />
                        <span>建議進行同步</span>
                      </div>
                    )}
                  </div>
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
                    className="w-20 dark:text-foreground/95"
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
                    className="w-20 dark:text-foreground/95"
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
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                管理作品標籤，可以新增、編輯和刪除標籤。
              </p>
              <Link href={getFullPath("/settings/tags")}>
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
              <p className="text-xs text-gray-600 dark:text-gray-400">
                啟用後會顯示瀏覽器通知，提醒您觀看進度。
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 平台資訊 */}
      <div className="mt-6">
        <PlatformInfo />
      </div>
    </div>
  );
}
