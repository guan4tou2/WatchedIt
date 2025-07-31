"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTheme } from "@/components/ThemeProvider";
import { Sun, Moon, Monitor, RefreshCw } from "lucide-react";

export default function TestThemePage() {
  const { theme, setTheme, systemTheme, resolvedTheme } = useTheme();
  const [mediaQuery, setMediaQuery] = useState<string>("");
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    // 獲取媒體查詢狀態
    if (typeof window !== "undefined") {
      const query = window.matchMedia("(prefers-color-scheme: dark)");
      setMediaQuery(query.matches ? "dark" : "light");

      const handleChange = (e: MediaQueryListEvent) => {
        setMediaQuery(e.matches ? "dark" : "light");
        setLastUpdate(new Date());
      };

      query.addEventListener("change", handleChange);
      return () => query.removeEventListener("change", handleChange);
    }
  }, []);

  const refreshInfo = () => {
    setLastUpdate(new Date());
  };

  return (
    <div className="container mx-auto p-4 sm:p-6">
      <h1 className="text-3xl font-bold mb-6">主題測試頁面</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 主題狀態 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Monitor className="w-5 h-5" />
              <span>主題狀態</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">當前主題設定</span>
                <Badge variant="outline">
                  {theme === "light"
                    ? "淺色"
                    : theme === "dark"
                    ? "深色"
                    : "自動"}
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">系統主題</span>
                <Badge variant="outline">
                  {systemTheme === "dark" ? "深色" : "淺色"}
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">實際應用主題</span>
                <Badge variant="default">
                  {resolvedTheme === "dark" ? "深色" : "淺色"}
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">媒體查詢狀態</span>
                <Badge variant="outline">
                  {mediaQuery === "dark" ? "深色" : "淺色"}
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">最後更新</span>
                <span className="text-xs text-gray-600">
                  {lastUpdate.toLocaleTimeString()}
                </span>
              </div>
            </div>

            <Button onClick={refreshInfo} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              刷新信息
            </Button>
          </CardContent>
        </Card>

        {/* 主題切換 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Sun className="w-5 h-5" />
              <span>主題切換</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <Button
                variant={theme === "light" ? "default" : "outline"}
                className="w-full"
                onClick={() => setTheme("light")}
              >
                <Sun className="w-4 h-4 mr-2" />
                淺色主題
              </Button>

              <Button
                variant={theme === "dark" ? "default" : "outline"}
                className="w-full"
                onClick={() => setTheme("dark")}
              >
                <Moon className="w-4 h-4 mr-2" />
                深色主題
              </Button>

              <Button
                variant={theme === "auto" ? "default" : "outline"}
                className="w-full"
                onClick={() => setTheme("auto")}
              >
                <Monitor className="w-4 h-4 mr-2" />
                自動主題
              </Button>
            </div>

            {theme === "auto" && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                <div className="text-xs text-blue-800 space-y-1">
                  <div className="font-medium">自動模式說明</div>
                  <div>• 跟隨系統主題設定</div>
                  <div>• 系統主題變化時自動切換</div>
                  <div>
                    • 當前系統主題: {systemTheme === "dark" ? "深色" : "淺色"}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 測試內容 */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>測試內容</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
                <h3 className="font-semibold mb-2">淺色背景</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  這是一個淺色背景的測試區域，在深色模式下會自動調整。
                </p>
              </div>

              <div className="p-4 bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg">
                <h3 className="font-semibold mb-2">深色背景</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  這是一個深色背景的測試區域，在淺色模式下會自動調整。
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Badge variant="default">預設標籤</Badge>
              <Badge variant="secondary">次要標籤</Badge>
              <Badge variant="outline">外框標籤</Badge>
              <Badge variant="destructive">危險標籤</Badge>
            </div>

            <div className="space-y-2">
              <div className="h-4 bg-blue-500 rounded"></div>
              <div className="h-4 bg-green-500 rounded"></div>
              <div className="h-4 bg-yellow-500 rounded"></div>
              <div className="h-4 bg-red-500 rounded"></div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 調試信息 */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>調試信息</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-xs font-mono space-y-1">
            <div>Theme: {theme}</div>
            <div>System Theme: {systemTheme}</div>
            <div>Resolved Theme: {resolvedTheme}</div>
            <div>Media Query: {mediaQuery}</div>
            <div>Last Update: {lastUpdate.toISOString()}</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
