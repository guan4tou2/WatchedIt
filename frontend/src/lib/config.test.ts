import { config, getApiBaseUrl, getApiUrl } from "./config";

// 模擬瀏覽器環境
const mockWindow = {
  location: {
    origin: "http://localhost:3000",
  },
};

// 模擬生產環境
const mockProductionWindow = {
  location: {
    origin: "https://watchedit.vercel.app",
  },
};

describe("Config Tests", () => {
  beforeEach(() => {
    // 清除環境變數
    delete process.env.NEXT_PUBLIC_API_URL;
    delete process.env.NODE_ENV;
  });

  test("應該使用環境變數作為 API URL", () => {
    process.env.NEXT_PUBLIC_API_URL = "https://api.example.com";
    const url = getApiBaseUrl();
    expect(url).toBe("https://api.example.com");
  });

  test("在開發環境中應該使用 localhost:8000", () => {
    process.env.NODE_ENV = "development";
    const url = getApiBaseUrl();
    expect(url).toBe("http://localhost:8000");
  });

  test("應該正確構建 API URL", () => {
    const fullUrl = getApiUrl("/search/anime");
    expect(fullUrl).toBe("http://localhost:8000/search/anime");
  });

  test("應該正確處理帶查詢參數的 URL", () => {
    const fullUrl = getApiUrl("/search/anime?query=test");
    expect(fullUrl).toBe("http://localhost:8000/search/anime?query=test");
  });

  test("配置物件應該包含正確的屬性", () => {
    expect(config.app.name).toBe("WatchedIt");
    expect(config.app.version).toBe("1.0.0");
    expect(config.isDevelopment).toBe(false);
    expect(config.isProduction).toBe(false);
  });
});
