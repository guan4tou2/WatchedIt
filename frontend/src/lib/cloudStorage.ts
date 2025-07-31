import { Work, Tag } from "@/types";

export interface CloudConfig {
  endpoint: string;
  apiKey?: string;
  userId?: string;
}

export interface SyncResult {
  success: boolean;
  message: string;
  data?: {
    works: Work[];
    tags: Tag[];
    lastSync: string;
  };
  error?: string;
}

export interface BackupData {
  works: Work[];
  tags: Tag[];
  backupDate: string;
  version: string;
  deviceId: string;
}

class CloudStorageService {
  private config: CloudConfig | null = null;
  private deviceId: string;

  constructor() {
    // 生成或取得設備 ID
    this.deviceId = this.getDeviceId();
  }

  private getDeviceId(): string {
    // 檢查是否在客戶端環境
    if (typeof window === "undefined") {
      return `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    let deviceId = localStorage.getItem("watchedit_device_id");
    if (!deviceId) {
      deviceId = `device_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`;
      localStorage.setItem("watchedit_device_id", deviceId);
    }
    return deviceId;
  }

  // 設定雲端配置
  setConfig(config: CloudConfig): void {
    this.config = config;
    if (typeof window !== "undefined") {
      localStorage.setItem("watchedit_cloud_config", JSON.stringify(config));
    }
  }

  // 取得雲端配置
  getConfig(): CloudConfig | null {
    if (!this.config) {
      if (typeof window !== "undefined") {
        const saved = localStorage.getItem("watchedit_cloud_config");
        if (saved) {
          this.config = JSON.parse(saved);
        }
      }
    }
    return this.config;
  }

  // 測試雲端連接
  async testConnection(endpoint: string): Promise<SyncResult> {
    try {
      const response = await fetch(`${endpoint}/health`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        return {
          success: true,
          message: "雲端連接測試成功",
        };
      } else {
        return {
          success: false,
          message: "雲端連接失敗",
          error: `HTTP ${response.status}: ${response.statusText}`,
        };
      }
    } catch (error) {
      return {
        success: false,
        message: "雲端連接失敗",
        error: error instanceof Error ? error.message : "未知錯誤",
      };
    }
  }

  // 上傳數據到雲端
  async uploadData(works: Work[], tags: Tag[]): Promise<SyncResult> {
    if (!this.config?.endpoint) {
      return {
        success: false,
        message: "未設定雲端端點",
        error: "請先在設定中配置雲端端點",
      };
    }

    try {
      const backupData: BackupData = {
        works,
        tags,
        backupDate: new Date().toISOString(),
        version: "1.0.0",
        deviceId: this.deviceId,
      };

      const response = await fetch(`${this.config.endpoint}/backup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(this.config.apiKey && {
            Authorization: `Bearer ${this.config.apiKey}`,
          }),
        },
        body: JSON.stringify(backupData),
      });

      if (response.ok) {
        const result = await response.json();
        return {
          success: true,
          message: "數據上傳成功",
          data: {
            works: result.works || works,
            tags: result.tags || tags,
            lastSync: new Date().toISOString(),
          },
        };
      } else {
        return {
          success: false,
          message: "數據上傳失敗",
          error: `HTTP ${response.status}: ${response.statusText}`,
        };
      }
    } catch (error) {
      return {
        success: false,
        message: "數據上傳失敗",
        error: error instanceof Error ? error.message : "未知錯誤",
      };
    }
  }

  // 從雲端下載數據
  async downloadData(): Promise<SyncResult> {
    if (!this.config?.endpoint) {
      return {
        success: false,
        message: "未設定雲端端點",
        error: "請先在設定中配置雲端端點",
      };
    }

    try {
      const response = await fetch(
        `${this.config.endpoint}/backup?device_id=${this.deviceId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            ...(this.config.apiKey && {
              Authorization: `Bearer ${this.config.apiKey}`,
            }),
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        return {
          success: true,
          message: "數據下載成功",
          data: {
            works: data.works || [],
            tags: data.tags || [],
            lastSync: new Date().toISOString(),
          },
        };
      } else {
        return {
          success: false,
          message: "數據下載失敗",
          error: `HTTP ${response.status}: ${response.statusText}`,
        };
      }
    } catch (error) {
      return {
        success: false,
        message: "數據下載失敗",
        error: error instanceof Error ? error.message : "未知錯誤",
      };
    }
  }

  // 同步數據（上傳和下載合併）
  async syncData(works: Work[], tags: Tag[]): Promise<SyncResult> {
    if (!this.config?.endpoint) {
      return {
        success: false,
        message: "未設定雲端端點",
        error: "請先在設定中配置雲端端點",
      };
    }

    try {
      // 先嘗試下載雲端數據
      const downloadResult = await this.downloadData();

      if (downloadResult.success && downloadResult.data) {
        // 合併本地和雲端數據
        const mergedWorks = this.mergeWorks(works, downloadResult.data.works);
        const mergedTags = this.mergeTags(tags, downloadResult.data.tags);

        // 上傳合併後的數據
        const uploadResult = await this.uploadData(mergedWorks, mergedTags);

        if (uploadResult.success) {
          return {
            success: true,
            message: "數據同步成功",
            data: {
              works: mergedWorks,
              tags: mergedTags,
              lastSync: new Date().toISOString(),
            },
          };
        } else {
          return uploadResult;
        }
      } else {
        // 如果下載失敗，只上傳本地數據
        return await this.uploadData(works, tags);
      }
    } catch (error) {
      return {
        success: false,
        message: "數據同步失敗",
        error: error instanceof Error ? error.message : "未知錯誤",
      };
    }
  }

  // 合併作品數據
  private mergeWorks(localWorks: Work[], cloudWorks: Work[]): Work[] {
    const merged = [...localWorks];
    const localIds = new Set(localWorks.map((w) => w.id));

    for (const cloudWork of cloudWorks) {
      if (!localIds.has(cloudWork.id)) {
        // 如果本地沒有這個作品，添加它
        merged.push(cloudWork);
      } else {
        // 如果本地有這個作品，比較更新時間
        const localWork = localWorks.find((w) => w.id === cloudWork.id);
        if (localWork && cloudWork.date_updated && localWork.date_updated) {
          const cloudDate = new Date(cloudWork.date_updated);
          const localDate = new Date(localWork.date_updated);
          if (cloudDate > localDate) {
            // 雲端版本更新，替換本地版本
            const index = merged.findIndex((w) => w.id === cloudWork.id);
            if (index !== -1) {
              merged[index] = cloudWork;
            }
          }
        }
      }
    }

    return merged;
  }

  // 合併標籤數據
  private mergeTags(localTags: Tag[], cloudTags: Tag[]): Tag[] {
    const merged = [...localTags];
    const localIds = new Set(localTags.map((t) => t.id));

    for (const cloudTag of cloudTags) {
      if (!localIds.has(cloudTag.id)) {
        // 如果本地沒有這個標籤，添加它
        merged.push(cloudTag);
      }
    }

    return merged;
  }

  // 取得最後同步時間
  getLastSyncTime(): string | null {
    if (typeof window === "undefined") {
      return null;
    }
    return localStorage.getItem("watchedit_last_sync");
  }

  // 設定最後同步時間
  setLastSyncTime(): void {
    if (typeof window !== "undefined") {
      localStorage.setItem("watchedit_last_sync", new Date().toISOString());
    }
  }

  // 檢查是否需要同步
  shouldSync(): boolean {
    const lastSync = this.getLastSyncTime();
    if (!lastSync) return true;

    const lastSyncDate = new Date(lastSync);
    const now = new Date();
    const hoursSinceLastSync =
      (now.getTime() - lastSyncDate.getTime()) / (1000 * 60 * 60);

    // 如果超過 1 小時沒有同步，建議同步
    return hoursSinceLastSync > 1;
  }

  // 清除雲端配置
  clearConfig(): void {
    this.config = null;
    if (typeof window !== "undefined") {
      localStorage.removeItem("watchedit_cloud_config");
      localStorage.removeItem("watchedit_last_sync");
    }
  }
}

// 創建單例實例
export const cloudStorage = new CloudStorageService();
