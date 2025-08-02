// PWA 服務註冊
export class PWAService {
  private static instance: PWAService;
  private registration: ServiceWorkerRegistration | null = null;

  private constructor() {}

  static getInstance(): PWAService {
    if (!PWAService.instance) {
      PWAService.instance = new PWAService();
    }
    return PWAService.instance;
  }

  // 註冊 Service Worker
  async registerServiceWorker(): Promise<void> {
    if ("serviceWorker" in navigator) {
      try {
        this.registration = await navigator.serviceWorker.register("/sw.js");
        console.log(
          "Service Worker registered successfully:",
          this.registration
        );
      } catch (error) {
        console.error("Service Worker registration failed:", error);
      }
    }
  }

  // 請求通知權限
  async requestNotificationPermission(): Promise<boolean> {
    if (!("Notification" in window)) {
      console.log("This browser does not support notifications");
      return false;
    }

    if (Notification.permission === "granted") {
      return true;
    }

    if (Notification.permission === "denied") {
      console.log("Notification permission denied");
      return false;
    }

    const permission = await Notification.requestPermission();
    return permission === "granted";
  }

  // 發送通知
  async sendNotification(
    title: string,
    options?: NotificationOptions
  ): Promise<void> {
    if (!("Notification" in window)) {
      return;
    }

    if (Notification.permission === "granted") {
      new Notification(title, {
        icon: "/icons/icon-192x192.png",
        badge: "/icons/icon-72x72.png",
        ...options,
      });
    } else if (Notification.permission !== "denied") {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        new Notification(title, {
          icon: "/icons/icon-192x192.png",
          badge: "/icons/icon-72x72.png",
          ...options,
        });
      }
    }
  }

  // 檢查是否為 PWA 模式
  isPWA(): boolean {
    try {
      return (
        window.matchMedia("(display-mode: standalone)").matches ||
        (window.navigator as any).standalone === true
      );
    } catch (error) {
      console.error("檢查 PWA 模式失敗:", error);
      return false;
    }
  }

  // 檢查是否為行動裝置
  isMobile(): boolean {
    try {
      return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      );
    } catch (error) {
      console.error("檢查行動裝置失敗:", error);
      return false;
    }
  }

  // 檢查是否為 iOS
  isIOS(): boolean {
    try {
      return /iPad|iPhone|iPod/.test(navigator.userAgent);
    } catch (error) {
      console.error("檢查 iOS 失敗:", error);
      return false;
    }
  }

  // 檢查是否為 Android
  isAndroid(): boolean {
    try {
      return /Android/.test(navigator.userAgent);
    } catch (error) {
      console.error("檢查 Android 失敗:", error);
      return false;
    }
  }

  // 檢查是否為桌面
  isDesktop(): boolean {
    return !this.isMobile();
  }

  // 取得平台資訊
  getPlatformInfo() {
    try {
      return {
        isPWA: this.isPWA(),
        isMobile: this.isMobile(),
        isIOS: this.isIOS(),
        isAndroid: this.isAndroid(),
        isDesktop: this.isDesktop(),
        userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "",
      };
    } catch (error) {
      console.error("取得平台資訊失敗:", error);
      return {
        isPWA: false,
        isMobile: false,
        isIOS: false,
        isAndroid: false,
        isDesktop: true,
        userAgent: "",
      };
    }
  }

  // 背景同步
  async backgroundSync(tag: string = "background-sync"): Promise<void> {
    if (this.registration && "sync" in this.registration) {
      try {
        await (this.registration as any).sync.register(tag);
        console.log("Background sync registered");
      } catch (error) {
        console.error("Background sync registration failed:", error);
      }
    }
  }

  // 更新檢查
  async checkForUpdate(): Promise<boolean> {
    if (this.registration) {
      await this.registration.update();
      return true;
    }
    return false;
  }
}

// 建立全域實例
export const pwaService = PWAService.getInstance();
