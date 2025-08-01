import { Work } from "@/types";
import { pwaService } from "./pwa";

// 提醒頻率類型
export type ReminderFrequency = "daily" | "weekly" | "monthly" | "custom";

// 提醒設定
export interface ReminderSettings {
  enabled: boolean;
  frequency: ReminderFrequency;
  customDays?: number; // 自訂天數
  lastReminderDate?: string; // 上次提醒日期
  nextReminderDate?: string; // 下次提醒日期
}

// 提醒服務類別
export class ReminderService {
  private static instance: ReminderService;

  private constructor() {}

  static getInstance(): ReminderService {
    if (!ReminderService.instance) {
      ReminderService.instance = new ReminderService();
    }
    return ReminderService.instance;
  }

  // 初始化提醒服務
  async initialize(): Promise<void> {
    // 請求通知權限
    await this.requestNotificationPermission();

    // 設定定期檢查提醒
    this.scheduleReminderCheck();
  }

  // 請求通知權限
  async requestNotificationPermission(): Promise<boolean> {
    if (typeof window === "undefined" || !("Notification" in window)) {
      return false;
    }

    if (Notification.permission === "granted") {
      return true;
    }

    if (Notification.permission === "denied") {
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      return permission === "granted";
    } catch (error) {
      console.error("請求通知權限失敗:", error);
      return false;
    }
  }

  // 計算下次提醒日期
  calculateNextReminderDate(
    frequency: ReminderFrequency,
    customDays?: number
  ): Date {
    const now = new Date();
    const nextDate = new Date(now);

    switch (frequency) {
      case "daily":
        nextDate.setDate(now.getDate() + 1);
        break;
      case "weekly":
        nextDate.setDate(now.getDate() + 7);
        break;
      case "monthly":
        nextDate.setMonth(now.getMonth() + 1);
        break;
      case "custom":
        if (customDays) {
          nextDate.setDate(now.getDate() + customDays);
        } else {
          nextDate.setDate(now.getDate() + 7); // 預設一週
        }
        break;
      default:
        nextDate.setDate(now.getDate() + 7);
    }

    return nextDate;
  }

  // 檢查是否需要發送提醒
  shouldSendReminder(work: Work): boolean {
    if (!work.reminder_enabled || !work.reminder_frequency) {
      return false;
    }

    // 檢查作品狀態，只有進行中的作品才發送提醒
    if (work.status !== "進行中") {
      return false;
    }

    // 檢查是否有未觀看的集數
    const unwatchedEpisodes = work.episodes.filter((ep) => !ep.watched);
    if (unwatchedEpisodes.length === 0) {
      return false;
    }

    // 檢查上次提醒日期
    const lastReminder = this.getLastReminderDate(work.id);
    if (lastReminder) {
      const lastDate = new Date(lastReminder);
      const now = new Date();
      const daysSinceLastReminder = Math.floor(
        (now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      // 根據頻率檢查是否需要發送
      switch (work.reminder_frequency) {
        case "daily":
          return daysSinceLastReminder >= 1;
        case "weekly":
          return daysSinceLastReminder >= 7;
        case "monthly":
          return daysSinceLastReminder >= 30;
        case "custom":
          // 自訂天數，預設7天
          return daysSinceLastReminder >= 7;
        default:
          return false;
      }
    }

    // 如果沒有上次提醒記錄，立即發送
    return true;
  }

  // 發送提醒通知
  async sendReminderNotification(work: Work): Promise<void> {
    const unwatchedEpisodes = work.episodes.filter((ep) => !ep.watched);
    const watchedEpisodes = work.episodes.filter((ep) => ep.watched);
    const totalEpisodes = work.episodes.length;

    const title = `📺 提醒：${work.title}`;
    const body = `您有 ${unwatchedEpisodes.length} 集未觀看，已觀看 ${watchedEpisodes.length}/${totalEpisodes} 集`;

    await this.sendNotification(title, {
      body,
      icon: "/icons/icon-192x192.png",
      badge: "/icons/icon-72x72.png",
      tag: `reminder-${work.id}`, // 防止重複通知
      requireInteraction: true, // 需要用戶互動
    });

    // 記錄提醒發送時間
    this.setLastReminderDate(work.id);
  }

  // 檢查所有作品的提醒
  async checkAllReminders(works: Work[]): Promise<void> {
    const worksWithReminders = works.filter(
      (work) => work.reminder_enabled && work.status === "進行中"
    );

    for (const work of worksWithReminders) {
      if (this.shouldSendReminder(work)) {
        await this.sendReminderNotification(work);
      }
    }
  }

  // 設定定期檢查提醒
  private scheduleReminderCheck(): void {
    // 每小時檢查一次提醒
    setInterval(() => {
      this.checkRemindersFromStorage();
    }, 60 * 60 * 1000); // 1小時

    // 頁面載入時也檢查一次
    this.checkRemindersFromStorage();
  }

  // 從儲存中檢查提醒
  private async checkRemindersFromStorage(): Promise<void> {
    try {
      // 從 localStorage 中取得作品列表
      const worksData = localStorage.getItem("watchedit_works");
      if (worksData) {
        const works: Work[] = JSON.parse(worksData);
        await this.checkAllReminders(works);
      }
    } catch (error) {
      console.error("檢查提醒時發生錯誤:", error);
    }
  }

  // 取得上次提醒日期
  private getLastReminderDate(workId: string): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(`reminder_last_${workId}`);
  }

  // 設定上次提醒日期
  private setLastReminderDate(workId: string): void {
    if (typeof window === "undefined") return;
    localStorage.setItem(`reminder_last_${workId}`, new Date().toISOString());
  }

  // 清除提醒記錄
  clearReminderHistory(workId: string): void {
    if (typeof window === "undefined") return;
    localStorage.removeItem(`reminder_last_${workId}`);
  }

  // 取得提醒統計
  getReminderStats(works: Work[]): {
    totalEnabled: number;
    activeReminders: number;
    overdueReminders: number;
  } {
    const enabledWorks = works.filter((work) => work.reminder_enabled);
    const activeWorks = enabledWorks.filter((work) => work.status === "進行中");
    const overdueWorks = activeWorks.filter((work) =>
      this.shouldSendReminder(work)
    );

    return {
      totalEnabled: enabledWorks.length,
      activeReminders: activeWorks.length,
      overdueReminders: overdueWorks.length,
    };
  }

  // 發送通知
  async sendNotification(
    title: string,
    options?: NotificationOptions
  ): Promise<void> {
    if (typeof window === "undefined" || !("Notification" in window)) {
      return;
    }

    if (Notification.permission !== "granted") {
      console.warn("通知權限未授權");
      return;
    }

    try {
      new Notification(title, options);
    } catch (error) {
      console.error("發送通知失敗:", error);
    }
  }

  // 測試提醒功能
  async testReminder(workTitle: string = "測試作品"): Promise<void> {
    const title = `🧪 測試提醒：${workTitle}`;
    const body = "這是一個測試提醒通知，用於驗證提醒功能是否正常運作。";

    await this.sendNotification(title, {
      body,
      icon: "/icons/icon-192x192.png",
      badge: "/icons/icon-72x72.png",
      tag: "test-reminder",
      requireInteraction: true,
    });
  }
}

// 建立全域實例
export const reminderService = ReminderService.getInstance();
