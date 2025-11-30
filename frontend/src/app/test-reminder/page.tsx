"use client";

import { useState } from "react";
import { reminderService } from "@/lib/reminder";
import { useWorkStore } from "@/store/useWorkStore";
import { Bell, TestTube, AlertTriangle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export default function TestReminderPage() {
  const { works, checkReminders, testReminder } = useWorkStore();
  const [testResults, setTestResults] = useState<string[]>([]);

  // 測試通知權限
  const testNotificationPermission = async () => {
    try {
      const hasPermission =
        await reminderService.requestNotificationPermission();
      const result = `通知權限測試: ${hasPermission ? "✅ 已授權" : "❌ 未授權"
        }`;
      setTestResults((prev) => [...prev, result]);
    } catch (error) {
      const result = `通知權限測試: ❌ 失敗 - ${error}`;
      setTestResults((prev) => [...prev, result]);
    }
  };

  // 測試提醒功能
  const handleTestReminder = async () => {
    try {
      await testReminder("測試作品");
      const result = "✅ 測試提醒已發送";
      setTestResults((prev) => [...prev, result]);
    } catch (error) {
      const result = `❌ 測試提醒失敗: ${error}`;
      setTestResults((prev) => [...prev, result]);
    }
  };

  // 檢查所有提醒
  const handleCheckAllReminders = async () => {
    try {
      await checkReminders();
      const result = "✅ 已檢查所有提醒";
      setTestResults((prev) => [...prev, result]);
    } catch (error) {
      const result = `❌ 檢查提醒失敗: ${error}`;
      setTestResults((prev) => [...prev, result]);
    }
  };

  // 清除測試結果
  const clearTestResults = () => {
    setTestResults([]);
  };

  // 取得提醒統計
  const reminderStats = reminderService.getReminderStats(works);
  const worksWithReminders = works.filter((work) => work.reminder_enabled);
  const worksNeedingReminders = worksWithReminders.filter(
    (work) =>
      work.status === "進行中" && reminderService.shouldSendReminder(work)
  );

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* 頁面標題 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <TestTube className="w-8 h-8" />
            提醒功能測試
          </h1>
          <p className="text-muted-foreground mt-2">測試提醒功能的各個組件</p>
        </div>
        <Button
          variant="outline"
          onClick={clearTestResults}
          className="flex items-center gap-2"
        >
          清除結果
        </Button>
      </div>

      {/* 統計資訊 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">總作品數</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{works.length}</div>
            <p className="text-xs text-muted-foreground">所有作品</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">啟用提醒</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {reminderStats.totalEnabled}
            </div>
            <p className="text-xs text-muted-foreground">已啟用提醒</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">活躍提醒</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {reminderStats.activeReminders}
            </div>
            <p className="text-xs text-muted-foreground">進行中的作品</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">需要提醒</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {reminderStats.overdueReminders}
            </div>
            <p className="text-xs text-muted-foreground">應該發送提醒</p>
          </CardContent>
        </Card>
      </div>

      {/* 測試按鈕 */}
      <Card>
        <CardHeader>
          <CardTitle>功能測試</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              onClick={testNotificationPermission}
              className="flex items-center gap-2"
            >
              <Bell className="w-4 h-4" />
              測試通知權限
            </Button>
            <Button
              onClick={handleTestReminder}
              className="flex items-center gap-2"
            >
              <TestTube className="w-4 h-4" />
              測試提醒通知
            </Button>
            <Button
              onClick={handleCheckAllReminders}
              className="flex items-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              檢查所有提醒
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 需要提醒的作品 */}
      {worksNeedingReminders.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>需要提醒的作品</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {worksNeedingReminders.map((work) => (
                <div
                  key={work.id}
                  className="border rounded-lg p-4 bg-red-50 dark:bg-red-950/20"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">{work.title}</h3>
                    <Badge
                      variant="destructive"
                      className="flex items-center gap-1"
                    >
                      <Bell className="w-3 h-3" />
                      需要提醒
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>提醒頻率: {work.reminder_frequency}</p>
                    <p>
                      未觀看集數:{" "}
                      {work.episodes.filter((ep) => !ep.watched).length}
                    </p>
                    <p>
                      已觀看: {work.episodes.filter((ep) => ep.watched).length}/
                      {work.episodes.length}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 測試結果 */}
      {testResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>測試結果</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {testResults.map((result, index) => (
                <div key={index} className="flex items-center gap-2">
                  <span className="text-sm">{result}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 通知權限狀態 */}
      <Card>
        <CardHeader>
          <CardTitle>系統狀態</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">通知權限</span>
              <Badge
                variant={
                  typeof window !== "undefined" && Notification.permission === "granted"
                    ? "default"
                    : "destructive"
                }
              >
                {typeof window !== "undefined" && Notification.permission === "granted" ? "已授權" : "未授權"}
              </Badge>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Service Worker</span>
              <Badge
                variant={
                  typeof window !== "undefined" && "serviceWorker" in navigator
                    ? "default"
                    : "destructive"
                }
              >
                {typeof window !== "undefined" && "serviceWorker" in navigator
                  ? "可用"
                  : "不可用"}
              </Badge>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">PWA 模式</span>
              <Badge variant="secondary">
                {typeof window !== "undefined" &&
                  window.matchMedia("(display-mode: standalone)").matches
                  ? "是"
                  : "否"}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
