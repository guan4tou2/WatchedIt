// 環境配置管理
export const config = {
  // 應用程式配置
  app: {
    name: process.env.NEXT_PUBLIC_APP_NAME || "WatchedIt",
    version: process.env.NEXT_PUBLIC_APP_VERSION || "1.0.0",
  },

  // 環境檢測
  isDevelopment: process.env.NODE_ENV === "development",
  isProduction: process.env.NODE_ENV === "production",
  isTest: process.env.NODE_ENV === "test",
};

// 動態獲取 API 基礎 URL
export const getApiBaseUrl = (): string => {
  // 1. 檢查環境變數
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }

  // 2. 在瀏覽器環境中，使用當前網址的 API 路徑
  if (typeof window !== "undefined") {
    const currentOrigin = window.location.origin;
    // 如果是本地開發環境，使用 localhost:8000
    if (
      currentOrigin.includes("localhost") ||
      currentOrigin.includes("127.0.0.1") ||
      currentOrigin.includes("localhost:3000")
    ) {
      return "http://localhost:8000";
    }
    // 生產環境使用相對路徑
    return "/api";
  }

  // 3. 在伺服器端渲染時，根據環境變數判斷
  if (process.env.NODE_ENV === "production") {
    return "/api";
  }

  // 4. 預設值
  return "http://localhost:8000";
};

// 檢查是否有可用的後端服務
export const hasBackendService = (): boolean => {
  const baseUrl = getApiBaseUrl();
  return baseUrl !== "/api" && baseUrl !== "NO_BACKEND";
};

// 導出完整的 API URL
export const getApiUrl = (endpoint: string): string => {
  const baseUrl = getApiBaseUrl();
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  return `${baseUrl}${cleanEndpoint}`;
};
