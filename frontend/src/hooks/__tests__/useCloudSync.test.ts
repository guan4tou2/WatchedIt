import { act, renderHook } from "@testing-library/react";
import { cloudStorage } from "@/lib/cloudStorage";
import { useWorkStore } from "@/store/useWorkStore";
import { useCloudSync } from "../useCloudSync";

jest.mock("@/lib/cloudStorage", () => ({
  cloudStorage: {
    getConfig: jest.fn(),
    getLastSyncTime: jest.fn(),
    setLastSyncTime: jest.fn(),
    shouldSync: jest.fn(),
    syncData: jest.fn(),
  },
}));

jest.mock("@/store/useWorkStore", () => ({
  useWorkStore: jest.fn(),
}));

const mockedCloudStorage = cloudStorage as jest.Mocked<typeof cloudStorage>;
const mockedUseWorkStore = useWorkStore as unknown as jest.Mock;

describe("useCloudSync", () => {
  const setIsSyncing = jest.fn();
  const updateWorks = jest.fn();
  const updateTags = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseWorkStore.mockReturnValue({
      works: [],
      tags: [],
      updateWorks,
      updateTags,
      isSyncing: false,
      setIsSyncing,
    });
    mockedCloudStorage.getLastSyncTime.mockReturnValue(null);
    mockedCloudStorage.shouldSync.mockReturnValue(true);
    mockedCloudStorage.getConfig.mockReturnValue({
      endpoint: "https://sync.example.test",
    });
  });

  it("returns the specific failure reason from cloud sync", async () => {
    mockedCloudStorage.syncData.mockResolvedValue({
      success: false,
      message: "數據上傳失敗",
      error: "HTTP 500: Internal Server Error",
    });

    const { result } = renderHook(() => useCloudSync());

    let syncResult: Awaited<ReturnType<typeof result.current.sync>> | undefined;
    await act(async () => {
      syncResult = await result.current.sync();
    });

    expect(syncResult).toEqual({
      success: false,
      error: "HTTP 500: Internal Server Error",
    });
    expect(result.current.error).toBe("HTTP 500: Internal Server Error");
    expect(setIsSyncing).toHaveBeenNthCalledWith(1, true);
    expect(setIsSyncing).toHaveBeenLastCalledWith(false);
  });

  it("returns a specific configuration error when no endpoint is configured", async () => {
    mockedCloudStorage.getConfig.mockReturnValue(null);

    const { result } = renderHook(() => useCloudSync());

    let syncResult: Awaited<ReturnType<typeof result.current.sync>> | undefined;
    await act(async () => {
      syncResult = await result.current.sync();
    });

    expect(syncResult).toEqual({
      success: false,
      error: "請先在設定中配置雲端端點",
    });
    expect(mockedCloudStorage.syncData).not.toHaveBeenCalled();
  });
});
