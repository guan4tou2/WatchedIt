"use client";

import { useState, useEffect } from "react";
import { Work } from "@/types";
import { reminderService } from "@/lib/reminder";
import { useWorkStore } from "@/store/useWorkStore";
import {
  Bell,
  BellOff,
  Clock,
  Settings,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";

export default function RemindersPage() {
  const { works, fetchWorks } = useWorkStore();
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadWorks = async () => {
      try {
        await fetchWorks();
        setLoading(false);
      } catch (error) {
        console.error("載入作品失敗:", error);
        setLoading(false);
      }
    };

    loadWorks();
  }, [fetchWorks]);

  // 取得提醒統計
  const reminderStats = reminderService.getReminderStats(works);

  // 有提醒的作品
  const worksWithReminders = works.filter((work) => work.reminder_enabled);

  // 需要提醒的作品
  const worksNeedingReminders = worksWithReminders.filter(
    (work) =>
      work.status === "進行中" && reminderService.shouldSendReminder(work)
  );

  // 檢查所有提醒
  const handleCheckAllReminders = async () => {
    try {
      await reminderService.checkAllReminders(works);
    } catch (error) {
      console.error("檢查提醒失敗:", error);
    }
  };

  // 測試提醒
  const handleTestReminder = async () => {
    try {
      await reminderService.testReminder("測試提醒");
    } catch (error) {
      console.error("測試提醒失敗:", error);
    }
  };

  // 清除所有提醒記錄
  const handleClearAllHistory = () => {
    works.forEach((work) => {
      reminderService.clearReminderHistory(work.id);
    });
  };

  // 格式化日期
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("zh-TW", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">載入中...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* 頁面標題 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Bell className="w-8 h-8" />
            提醒管理
          </h1>
          <p className="text-muted-foreground mt-2">
            管理您的作品提醒設定和通知
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleCheckAllReminders}
            className="flex items-center gap-2"
          >
            <Clock className="w-4 h-4" />
            檢查提醒
          </Button>
          <Button
            variant="outline"
            onClick={handleTestReminder}
            className="flex items-center gap-2"
          >
            <Bell className="w-4 h-4" />
            測試提醒
          </Button>
        </div>
      </div>

      {/* 統計卡片 */}
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
            <p className="text-xs text-muted-foreground">已啟用提醒的作品</p>
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

      {/* 標籤頁 */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">概覽</TabsTrigger>
          <TabsTrigger value="active">活躍提醒</TabsTrigger>
          <TabsTrigger value="settings">設定</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>提醒概覽</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {worksWithReminders.length === 0 ? (
                <div className="text-center py-8">
                  <BellOff className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">尚未設定提醒</h3>
                  <p className="text-muted-foreground">
                    您還沒有為任何作品設定提醒功能
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {worksWithReminders.map((work) => (
                    <div key={work.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium">{work.title}</h3>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={
                              work.status === "進行中" ? "default" : "secondary"
                            }
                          >
                            {work.status}
                          </Badge>
                          {reminderService.shouldSendReminder(work) && (
                            <Badge
                              variant="destructive"
                              className="flex items-center gap-1"
                            >
                              <Bell className="w-3 h-3" />
                              需要提醒
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p>提醒頻率: {work.reminder_frequency || "未設定"}</p>
                        <p>
                          未觀看集數:{" "}
                          {work.episodes.filter((ep) => !ep.watched).length}
                        </p>
                        <p>總集數: {work.episodes.length}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="active" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>需要提醒的作品</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {worksNeedingReminders.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">
                    沒有需要提醒的作品
                  </h3>
                  <p className="text-muted-foreground">
                    所有作品都按時觀看，或提醒設定正確
                  </p>
                </div>
              ) : (
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
                          已觀看:{" "}
                          {work.episodes.filter((ep) => ep.watched).length}/
                          {work.episodes.length}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>提醒設定</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">自動檢查提醒</h3>
                    <p className="text-sm text-muted-foreground">
                      系統會定期檢查並發送提醒通知
                    </p>
                  </div>
                  <Badge variant="secondary">已啟用</Badge>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">通知權限</h3>
                    <p className="text-sm text-muted-foreground">
                      檢查瀏覽器通知權限狀態
                    </p>
                  </div>
                  <Badge
                    variant={
                      typeof Notification !== "undefined" &&
                      Notification.permission === "granted"
                        ? "default"
                        : "destructive"
                    }
                  >
                    {typeof Notification !== "undefined" &&
                    Notification.permission === "granted"
                      ? "已授權"
                      : "未授權"}
                  </Badge>
                </div>

                <Separator />

                <div className="space-y-2">
                  <h3 className="font-medium">操作</h3>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleClearAllHistory}
                      className="flex items-center gap-2"
                    >
                      <Settings className="w-4 h-4" />
                      清除所有記錄
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
