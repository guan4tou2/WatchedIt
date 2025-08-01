import { Work, Tag } from "@/types";
import { workStorage, tagStorage } from "./indexedDB";

// 備份資料結構
export interface BackupData {
  version: string;
  timestamp: string;
  works: Work[];
  tags: Tag[];
  metadata: {
    totalWorks: number;
    totalTags: number;
    totalEpisodes: number;
    watchedEpisodes: number;
    completionRate: number;
  };
}

// 備份格式類型
export type BackupFormat = "json" | "csv";

// 備份服務類別
export class BackupService {
  private static instance: BackupService;
  private readonly VERSION = "1.0.0";

  private constructor() {}

  static getInstance(): BackupService {
    if (!BackupService.instance) {
      BackupService.instance = new BackupService();
    }
    return BackupService.instance;
  }

  // 建立備份資料
  async createBackup(): Promise<BackupData> {
    try {
      const works = await workStorage.getAll();
      const tags = await tagStorage.getAll();

      // 計算統計資料
      const totalEpisodes = works.reduce(
        (sum, work) => sum + work.episodes.length,
        0
      );
      const watchedEpisodes = works.reduce(
        (sum, work) => sum + work.episodes.filter((ep) => ep.watched).length,
        0
      );
      const completionRate =
        totalEpisodes > 0 ? (watchedEpisodes / totalEpisodes) * 100 : 0;

      const backupData: BackupData = {
        version: this.VERSION,
        timestamp: new Date().toISOString(),
        works,
        tags,
        metadata: {
          totalWorks: works.length,
          totalTags: tags.length,
          totalEpisodes,
          watchedEpisodes,
          completionRate: Math.round(completionRate * 100) / 100,
        },
      };

      return backupData;
    } catch (error) {
      console.error("建立備份失敗:", error);
      throw new Error("建立備份失敗");
    }
  }

  // 匯出備份到檔案
  async exportBackup(format: BackupFormat = "json"): Promise<void> {
    try {
      const backupData = await this.createBackup();
      let content: string;
      let filename: string;
      let mimeType: string;

      if (format === "json") {
        content = JSON.stringify(backupData, null, 2);
        filename = `watchedit-backup-${
          new Date().toISOString().split("T")[0]
        }.json`;
        mimeType = "application/json";
      } else {
        content = this.convertToCSV(backupData);
        filename = `watchedit-backup-${
          new Date().toISOString().split("T")[0]
        }.csv`;
        mimeType = "text/csv";
      }

      // 建立下載連結
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("匯出備份失敗:", error);
      throw new Error("匯出備份失敗");
    }
  }

  // 從檔案匯入備份
  async importBackup(file: File): Promise<BackupData> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = async (event) => {
        try {
          const content = event.target?.result as string;
          let backupData: BackupData;

          if (file.name.endsWith(".json")) {
            backupData = JSON.parse(content);
          } else if (file.name.endsWith(".csv")) {
            backupData = this.parseFromCSV(content);
          } else {
            throw new Error("不支援的檔案格式");
          }

          // 驗證備份資料
          this.validateBackupData(backupData);
          resolve(backupData);
        } catch (error) {
          console.error("匯入備份失敗:", error);
          reject(new Error("匯入備份失敗"));
        }
      };

      reader.onerror = () => {
        reject(new Error("讀取檔案失敗"));
      };

      reader.readAsText(file);
    });
  }

  // 還原備份資料
  async restoreBackup(backupData: BackupData): Promise<void> {
    try {
      // 驗證備份資料
      this.validateBackupData(backupData);

      // 清除現有資料
      await workStorage.clearAll();
      await tagStorage.clearAll();

      // 還原標籤（先還原標籤，因為作品會引用標籤）
      if (backupData.tags && backupData.tags.length > 0) {
        await tagStorage.setAll(backupData.tags);
      }

      // 還原作品
      if (backupData.works && backupData.works.length > 0) {
        await workStorage.setAll(backupData.works);
      }

      console.log("備份還原成功");
    } catch (error) {
      console.error("還原備份失敗:", error);
      throw new Error("還原備份失敗");
    }
  }

  // 驗證備份資料
  private validateBackupData(backupData: any): void {
    if (!backupData || typeof backupData !== "object") {
      throw new Error("無效的備份資料格式");
    }

    if (!backupData.version || !backupData.timestamp) {
      throw new Error("備份資料缺少版本或時間戳");
    }

    if (!Array.isArray(backupData.works) || !Array.isArray(backupData.tags)) {
      throw new Error("備份資料缺少作品或標籤資料");
    }

    // 檢查版本相容性
    if (backupData.version !== this.VERSION) {
      console.warn(
        `備份版本 (${backupData.version}) 與當前版本 (${this.VERSION}) 不同`
      );
    }
  }

  // 轉換為 CSV 格式
  private convertToCSV(backupData: BackupData): string {
    const lines: string[] = [];

    // 添加標題行
    lines.push("WatchedIt Backup Data");
    lines.push(`Version: ${backupData.version}`);
    lines.push(`Timestamp: ${backupData.timestamp}`);
    lines.push("");

    // 添加統計資訊
    lines.push("Metadata");
    lines.push(`Total Works,${backupData.metadata.totalWorks}`);
    lines.push(`Total Tags,${backupData.metadata.totalTags}`);
    lines.push(`Total Episodes,${backupData.metadata.totalEpisodes}`);
    lines.push(`Watched Episodes,${backupData.metadata.watchedEpisodes}`);
    lines.push(`Completion Rate,${backupData.metadata.completionRate}%`);
    lines.push("");

    // 添加標籤資料
    lines.push("Tags");
    lines.push("ID,Name,Color");
    backupData.tags.forEach((tag) => {
      lines.push(`${tag.id},"${tag.name}",${tag.color}`);
    });
    lines.push("");

    // 添加作品資料
    lines.push("Works");
    lines.push(
      "ID,Title,Type,Status,Year,Rating,Review,Note,Source,Reminder Enabled,Reminder Frequency,Date Added,Date Updated"
    );
    backupData.works.forEach((work) => {
      const row = [
        work.id,
        `"${work.title}"`,
        work.type,
        work.status,
        work.year || "",
        work.rating || "",
        `"${work.review || ""}"`,
        `"${work.note || ""}"`,
        work.source || "",
        work.reminder_enabled ? "true" : "false",
        work.reminder_frequency || "",
        work.date_added,
        work.date_updated || "",
      ];
      lines.push(row.join(","));
    });
    lines.push("");

    // 添加集數資料
    lines.push("Episodes");
    lines.push(
      "Work ID,Episode ID,Number,Title,Description,Type,Season,Watched,Date Watched,Note"
    );
    backupData.works.forEach((work) => {
      work.episodes.forEach((episode) => {
        const row = [
          work.id,
          episode.id,
          episode.number,
          `"${episode.title || ""}"`,
          `"${episode.description || ""}"`,
          episode.type,
          episode.season,
          episode.watched ? "true" : "false",
          episode.date_watched || "",
          `"${episode.note || ""}"`,
        ];
        lines.push(row.join(","));
      });
    });

    return lines.join("\n");
  }

  // 從 CSV 解析資料
  private parseFromCSV(content: string): BackupData {
    const lines = content.split("\n");
    const backupData: BackupData = {
      version: this.VERSION,
      timestamp: new Date().toISOString(),
      works: [],
      tags: [],
      metadata: {
        totalWorks: 0,
        totalTags: 0,
        totalEpisodes: 0,
        watchedEpisodes: 0,
        completionRate: 0,
      },
    };

    let currentSection = "";
    let worksMap = new Map<string, Work>();

    for (const line of lines) {
      const trimmedLine = line.trim();
      if (!trimmedLine) continue;

      if (trimmedLine === "Tags") {
        currentSection = "tags";
        continue;
      } else if (trimmedLine === "Works") {
        currentSection = "works";
        continue;
      } else if (trimmedLine === "Episodes") {
        currentSection = "episodes";
        continue;
      }

      if (currentSection === "tags" && !trimmedLine.startsWith("ID,")) {
        const [id, name, color] = trimmedLine.split(",");
        if (id && name && color) {
          backupData.tags.push({
            id: parseInt(id),
            name: name.replace(/"/g, ""),
            color: color,
          });
        }
      } else if (currentSection === "works" && !trimmedLine.startsWith("ID,")) {
        const parts = this.parseCSVLine(trimmedLine);
        if (parts.length >= 13) {
          const work: Work = {
            id: parts[0],
            title: parts[1].replace(/"/g, ""),
            type: parts[2],
            status: parts[3] as any,
            year: parts[4] ? parseInt(parts[4]) : undefined,
            rating: parts[5] ? parseInt(parts[5]) : undefined,
            review: parts[6].replace(/"/g, ""),
            note: parts[7].replace(/"/g, ""),
            source: parts[8],
            reminder_enabled: parts[9] === "true",
            reminder_frequency:
              (parts[10] as "daily" | "weekly" | "monthly" | "custom") ||
              undefined,
            tags: [],
            episodes: [],
            date_added: parts[11],
            date_updated: parts[12] || undefined,
          };
          worksMap.set(work.id, work);
          backupData.works.push(work);
        }
      } else if (
        currentSection === "episodes" &&
        !trimmedLine.startsWith("Work ID,")
      ) {
        const parts = this.parseCSVLine(trimmedLine);
        if (parts.length >= 10) {
          const workId = parts[0];
          const work = worksMap.get(workId);
          if (work) {
            const episode: any = {
              id: parts[1],
              number: parseInt(parts[2]),
              title: parts[3].replace(/"/g, ""),
              description: parts[4].replace(/"/g, ""),
              type: parts[5],
              season: parseInt(parts[6]),
              watched: parts[7] === "true",
              date_watched: parts[8] || undefined,
              note: parts[9].replace(/"/g, ""),
            };
            work.episodes.push(episode);
          }
        }
      }
    }

    // 計算統計資料
    backupData.metadata.totalWorks = backupData.works.length;
    backupData.metadata.totalTags = backupData.tags.length;
    backupData.metadata.totalEpisodes = backupData.works.reduce(
      (sum, work) => sum + work.episodes.length,
      0
    );
    backupData.metadata.watchedEpisodes = backupData.works.reduce(
      (sum, work) => sum + work.episodes.filter((ep) => ep.watched).length,
      0
    );
    backupData.metadata.completionRate =
      backupData.metadata.totalEpisodes > 0
        ? (backupData.metadata.watchedEpisodes /
            backupData.metadata.totalEpisodes) *
          100
        : 0;

    return backupData;
  }

  // 解析 CSV 行（處理引號內的逗號）
  private parseCSVLine(line: string): string[] {
    const result: string[] = [];
    let current = "";
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === "," && !inQuotes) {
        result.push(current);
        current = "";
      } else {
        current += char;
      }
    }
    result.push(current);

    return result;
  }

  // 取得資料庫資訊
  async getDatabaseInfo(): Promise<{
    worksCount: number;
    tagsCount: number;
    totalEpisodes: number;
    watchedEpisodes: number;
    completionRate: number;
    lastBackup?: string;
  }> {
    try {
      const works = await workStorage.getAll();
      const tags = await tagStorage.getAll();

      const totalEpisodes = works.reduce(
        (sum, work) => sum + work.episodes.length,
        0
      );
      const watchedEpisodes = works.reduce(
        (sum, work) => sum + work.episodes.filter((ep) => ep.watched).length,
        0
      );
      const completionRate =
        totalEpisodes > 0 ? (watchedEpisodes / totalEpisodes) * 100 : 0;

      // 取得最後備份時間
      const lastBackup = localStorage.getItem("watchedit_last_backup");

      return {
        worksCount: works.length,
        tagsCount: tags.length,
        totalEpisodes,
        watchedEpisodes,
        completionRate: Math.round(completionRate * 100) / 100,
        lastBackup: lastBackup || undefined,
      };
    } catch (error) {
      console.error("取得資料庫資訊失敗:", error);
      throw new Error("取得資料庫資訊失敗");
    }
  }

  // 記錄備份時間
  private recordBackupTime(): void {
    localStorage.setItem("watchedit_last_backup", new Date().toISOString());
  }

  // 自動備份
  async autoBackup(): Promise<void> {
    try {
      const backupData = await this.createBackup();
      const backupKey = `watchedit_auto_backup_${
        new Date().toISOString().split("T")[0]
      }`;

      localStorage.setItem(backupKey, JSON.stringify(backupData));
      this.recordBackupTime();

      // 清理舊的自動備份（保留最近 7 天）
      this.cleanupOldAutoBackups();
    } catch (error) {
      console.error("自動備份失敗:", error);
    }
  }

  // 清理舊的自動備份
  private cleanupOldAutoBackups(): void {
    const keys = Object.keys(localStorage);
    const autoBackupKeys = keys.filter((key) =>
      key.startsWith("watchedit_auto_backup_")
    );

    // 按日期排序，保留最近 7 天的備份
    const sortedKeys = autoBackupKeys.sort().reverse();
    const keysToRemove = sortedKeys.slice(7);

    keysToRemove.forEach((key) => {
      localStorage.removeItem(key);
    });
  }

  // 從自動備份還原
  async restoreFromAutoBackup(date: string): Promise<void> {
    const backupKey = `watchedit_auto_backup_${date}`;
    const backupData = localStorage.getItem(backupKey);

    if (!backupData) {
      throw new Error("找不到指定的自動備份");
    }

    try {
      const parsedData = JSON.parse(backupData);
      await this.restoreBackup(parsedData);
    } catch (error) {
      console.error("從自動備份還原失敗:", error);
      throw new Error("從自動備份還原失敗");
    }
  }

  // 取得可用的自動備份列表
  getAutoBackupList(): Array<{ date: string; size: number }> {
    const keys = Object.keys(localStorage);
    const autoBackupKeys = keys.filter((key) =>
      key.startsWith("watchedit_auto_backup_")
    );

    return autoBackupKeys
      .map((key) => {
        const date = key.replace("watchedit_auto_backup_", "");
        const size = localStorage.getItem(key)?.length || 0;
        return { date, size };
      })
      .sort((a, b) => b.date.localeCompare(a.date));
  }
}

// 建立全域實例
export const backupService = BackupService.getInstance();
