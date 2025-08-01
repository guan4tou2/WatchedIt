"use client";

import { useState, useEffect } from "react";
import { Work, ReminderFrequency } from "@/types";
import { reminderService } from "@/lib/reminder";
import { Bell, BellOff, Clock, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ReminderSettingsProps {
  work: Work;
  onUpdate: (work: Work) => void;
}

const REMINDER_FREQUENCIES: {
  value: ReminderFrequency;
  label: string;
  description: string;
}[] = [
  { value: "daily", label: "每日", description: "每天提醒一次" },
  { value: "weekly", label: "每週", description: "每週提醒一次" },
  { value: "monthly", label: "每月", description: "每月提醒一次" },
  { value: "custom", label: "自訂", description: "自訂提醒間隔" },
];

export default function ReminderSettings({
  work,
  onUpdate,
}: ReminderSettingsProps) {
  const [enabled, setEnabled] = useState(work.reminder_enabled);
  const [frequency, setFrequency] = useState<ReminderFrequency>(
    (work.reminder_frequency as ReminderFrequency) || "weekly"
  );
  const [customDays, setCustomDays] = useState(7);
  const [nextReminderDate, setNextReminderDate] = useState<Date | null>(null);

  // 計算下次提醒日期
  useEffect(() => {
    if (enabled && frequency) {
      const nextDate = reminderService.calculateNextReminderDate(
        frequency,
        customDays
      );
      setNextReminderDate(nextDate);
    } else {
      setNextReminderDate(null);
    }
  }, [enabled, frequency, customDays]);

  // 更新作品提醒設定
  const updateReminderSettings = () => {
    const updatedWork: Work = {
      ...work,
      reminder_enabled: enabled,
      reminder_frequency: frequency,
    };
    onUpdate(updatedWork);
  };

  // 處理開關變更
  const handleToggle = (checked: boolean) => {
    setEnabled(checked);
    if (checked) {
      // 啟用提醒時，請求通知權限
      reminderService.initialize();
    }
  };

  // 處理頻率變更
  const handleFrequencyChange = (value: string) => {
    const newFrequency = value as ReminderFrequency;
    setFrequency(newFrequency);
  };

  // 測試提醒功能
  const handleTestReminder = async () => {
    try {
      await reminderService.testReminder(work.title);
    } catch (error) {
      console.error("測試提醒失敗:", error);
    }
  };

  // 清除提醒記錄
  const handleClearHistory = () => {
    reminderService.clearReminderHistory(work.id);
  };

  // 格式化日期
  const formatDate = (date: Date) => {
    return date.toLocaleDateString("zh-TW", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // 檢查是否應該發送提醒
  const shouldSendReminder = reminderService.shouldSendReminder(work);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="w-5 h-5" />
          提醒設定
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 提醒開關 */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label className="text-base font-medium">啟用提醒</Label>
            <p className="text-sm text-muted-foreground">
              當作品有未觀看集數時發送通知提醒
            </p>
          </div>
          <Switch
            checked={enabled}
            onCheckedChange={handleToggle}
            aria-label="啟用提醒"
          />
        </div>

        {enabled && (
          <>
            {/* 提醒頻率 */}
            <div className="space-y-2">
              <Label htmlFor="frequency">提醒頻率</Label>
              <Select value={frequency} onValueChange={handleFrequencyChange}>
                <SelectTrigger>
                  <SelectValue placeholder="選擇提醒頻率" />
                </SelectTrigger>
                <SelectContent>
                  {REMINDER_FREQUENCIES.map((freq) => (
                    <SelectItem key={freq.value} value={freq.value}>
                      <div className="flex flex-col">
                        <span className="font-medium">{freq.label}</span>
                        <span className="text-xs text-muted-foreground">
                          {freq.description}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 自訂天數 */}
            {frequency === "custom" && (
              <div className="space-y-2">
                <Label htmlFor="customDays">自訂天數</Label>
                <Input
                  id="customDays"
                  type="number"
                  min="1"
                  max="365"
                  value={customDays}
                  onChange={(e) => setCustomDays(parseInt(e.target.value) || 7)}
                  placeholder="輸入天數"
                />
                <p className="text-xs text-muted-foreground">
                  設定提醒間隔的天數（1-365天）
                </p>
              </div>
            )}

            {/* 下次提醒時間 */}
            {nextReminderDate && (
              <div className="space-y-2">
                <Label>下次提醒時間</Label>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">
                    {formatDate(nextReminderDate)}
                  </span>
                </div>
              </div>
            )}

            {/* 提醒狀態 */}
            <div className="space-y-2">
              <Label>提醒狀態</Label>
              <div className="flex items-center gap-2">
                {shouldSendReminder ? (
                  <Badge
                    variant="destructive"
                    className="flex items-center gap-1"
                  >
                    <Bell className="w-3 h-3" />
                    需要提醒
                  </Badge>
                ) : (
                  <Badge
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    <BellOff className="w-3 h-3" />
                    無需提醒
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {shouldSendReminder
                  ? "根據設定，現在應該發送提醒"
                  : "根據設定，現在不需要發送提醒"}
              </p>
            </div>

            {/* 操作按鈕 */}
            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleTestReminder}
                className="flex items-center gap-2"
              >
                <Bell className="w-4 h-4" />
                測試提醒
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearHistory}
                className="flex items-center gap-2"
              >
                <Settings className="w-4 h-4" />
                清除記錄
              </Button>
            </div>
          </>
        )}

        {/* 儲存按鈕 */}
        <Button
          onClick={updateReminderSettings}
          className="w-full"
          disabled={!enabled}
        >
          儲存提醒設定
        </Button>
      </CardContent>
    </Card>
  );
}
