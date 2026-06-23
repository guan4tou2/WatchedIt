import { cloudStorage } from "../cloudStorage";

const mockedFetch = jest.fn();

describe("cloudStorage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = mockedFetch as unknown as typeof fetch;
    cloudStorage.clearConfig();
    localStorage.clear();
  });

  it("loads a saved cloud config before uploading data", async () => {
    localStorage.setItem(
      "watchedit_cloud_config",
      JSON.stringify({
        endpoint: "https://sync.example.test",
        apiKey: "secret-token",
      })
    );
    mockedFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ works: [], tags: [] }),
    });

    const result = await cloudStorage.uploadData([], []);

    expect(result.success).toBe(true);
    expect(mockedFetch).toHaveBeenCalledWith(
      "https://sync.example.test/backup",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          Authorization: "Bearer secret-token",
        }),
      })
    );
  });

  it("normalizes endpoint whitespace and trailing slashes before requests", async () => {
    cloudStorage.setConfig({
      endpoint: " https://sync.example.test/cloud/// ",
    });
    mockedFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ works: [], tags: [] }),
    });

    await cloudStorage.uploadData([], []);

    expect(mockedFetch).toHaveBeenCalledWith(
      "https://sync.example.test/cloud/backup",
      expect.objectContaining({ method: "POST" })
    );
    expect(JSON.parse(localStorage.getItem("watchedit_cloud_config") ?? "{}"))
      .toMatchObject({
        endpoint: "https://sync.example.test/cloud",
      });
  });

  it("normalizes endpoint input before testing cloud connection", async () => {
    mockedFetch.mockResolvedValue({
      ok: true,
    });

    await cloudStorage.testConnection(" https://sync.example.test/cloud/ ");

    expect(mockedFetch).toHaveBeenCalledWith(
      "https://sync.example.test/cloud/health",
      expect.objectContaining({ method: "GET" })
    );
  });

  it("returns a stable technical error when upload fails over HTTP", async () => {
    cloudStorage.setConfig({ endpoint: "https://sync.example.test" });
    mockedFetch.mockResolvedValue({
      ok: false,
      status: 503,
      statusText: "Service Unavailable",
    });

    const result = await cloudStorage.uploadData([], []);

    expect(result).toEqual({
      success: false,
      message: "數據上傳失敗",
      error: "HTTP 503: Service Unavailable",
    });
  });

  it("returns a stable fallback error when upload throws a non-Error value", async () => {
    cloudStorage.setConfig({ endpoint: "https://sync.example.test" });
    mockedFetch.mockRejectedValue("network down");

    const result = await cloudStorage.uploadData([], []);

    expect(result).toEqual({
      success: false,
      message: "數據上傳失敗",
      error: "未知錯誤",
    });
  });

  it("clears invalid saved cloud config instead of throwing during reads", async () => {
    localStorage.setItem("watchedit_cloud_config", "{invalid-json");

    expect(cloudStorage.getConfig()).toBeNull();

    const result = await cloudStorage.uploadData([], []);

    expect(result).toEqual({
      success: false,
      message: "未設定雲端端點",
      error: "請先在設定中配置雲端端點",
    });
    expect(localStorage.getItem("watchedit_cloud_config")).toBeNull();
    expect(mockedFetch).not.toHaveBeenCalled();
  });

  it("does not upload local data when bidirectional sync cannot download cloud data", async () => {
    cloudStorage.setConfig({ endpoint: "https://sync.example.test" });
    mockedFetch
      .mockResolvedValueOnce({
        ok: false,
        status: 503,
        statusText: "Service Unavailable",
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ works: [], tags: [] }),
      });

    const result = await cloudStorage.syncData([], []);

    expect(result).toEqual({
      success: false,
      message: "數據下載失敗",
      error: "HTTP 503: Service Unavailable",
    });
    expect(mockedFetch).toHaveBeenCalledTimes(1);
  });
});
