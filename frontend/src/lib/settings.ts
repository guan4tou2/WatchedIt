export interface Settings {
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

const DEFAULT_SETTINGS: Settings = {
  storageMode: "local",
  cloudEndpoint: "",
  autoSync: false,
  syncInterval: 30,
  notifications: true,
  theme: "auto",
  language: "zh-TW",
  dataBackup: true,
  dataBackupInterval: 7,
};

class SettingsService {
  private static instance: SettingsService;
  private settings: Settings;

  private constructor() {
    this.settings = this.loadSettings();
  }

  static getInstance(): SettingsService {
    if (!SettingsService.instance) {
      SettingsService.instance = new SettingsService();
    }
    return SettingsService.instance;
  }

  private loadSettings(): Settings {
    try {
      const savedSettings = localStorage.getItem("watchedit_settings");
      if (savedSettings) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(savedSettings) };
      }
    } catch (error) {
      console.error("載入設定失敗:", error);
    }
    return { ...DEFAULT_SETTINGS };
  }

  getSettings(): Settings {
    return { ...this.settings };
  }

  updateSettings(newSettings: Partial<Settings>): void {
    this.settings = { ...this.settings, ...newSettings };
    this.saveSettings();
  }

  private saveSettings(): void {
    try {
      localStorage.setItem("watchedit_settings", JSON.stringify(this.settings));
    } catch (error) {
      console.error("儲存設定失敗:", error);
    }
  }

  // 儲存模式相關方法
  getStorageMode(): "local" | "cloud" {
    return this.settings.storageMode;
  }

  setStorageMode(mode: "local" | "cloud"): void {
    this.updateSettings({ storageMode: mode });
  }

  // 雲端設定相關方法
  getCloudEndpoint(): string {
    return this.settings.cloudEndpoint;
  }

  setCloudEndpoint(endpoint: string): void {
    this.updateSettings({ cloudEndpoint: endpoint });
  }

  // 同步設定相關方法
  isAutoSyncEnabled(): boolean {
    return this.settings.autoSync;
  }

  setAutoSync(enabled: boolean): void {
    this.updateSettings({ autoSync: enabled });
  }

  getSyncInterval(): number {
    return this.settings.syncInterval;
  }

  setSyncInterval(interval: number): void {
    this.updateSettings({ syncInterval: interval });
  }

  // 通知設定相關方法
  areNotificationsEnabled(): boolean {
    return this.settings.notifications;
  }

  setNotifications(enabled: boolean): void {
    this.updateSettings({ notifications: enabled });
  }

  // 主題設定相關方法
  getTheme(): "light" | "dark" | "auto" {
    return this.settings.theme;
  }

  setTheme(theme: "light" | "dark" | "auto"): void {
    this.updateSettings({ theme });
    this.applyTheme(theme);
  }

  private applyTheme(theme: "light" | "dark" | "auto"): void {
    const root = document.documentElement;

    if (theme === "auto") {
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;
      root.classList.toggle("dark", prefersDark);
    } else {
      root.classList.toggle("dark", theme === "dark");
    }
  }

  // 語言設定相關方法
  getLanguage(): "zh-TW" | "en-US" {
    return this.settings.language;
  }

  setLanguage(language: "zh-TW" | "en-US"): void {
    this.updateSettings({ language });
  }

  // 備份設定相關方法
  isDataBackupEnabled(): boolean {
    return this.settings.dataBackup;
  }

  setDataBackup(enabled: boolean): void {
    this.updateSettings({ dataBackup: enabled });
  }

  getDataBackupInterval(): number {
    return this.settings.dataBackupInterval;
  }

  setDataBackupInterval(interval: number): void {
    this.updateSettings({ dataBackupInterval: interval });
  }

  // 重置設定
  resetSettings(): void {
    this.settings = { ...DEFAULT_SETTINGS };
    this.saveSettings();
  }

  // 匯出設定
  exportSettings(): string {
    return JSON.stringify(this.settings, null, 2);
  }

  // 匯入設定
  importSettings(settingsJson: string): boolean {
    try {
      const importedSettings = JSON.parse(settingsJson);
      this.settings = { ...DEFAULT_SETTINGS, ...importedSettings };
      this.saveSettings();
      return true;
    } catch (error) {
      console.error("匯入設定失敗:", error);
      return false;
    }
  }
}

export const settingsService = SettingsService.getInstance();
