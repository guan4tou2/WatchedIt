import React, { act } from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import SettingsPage from "../page";
import { cloudStorage } from "@/lib/cloudStorage";
import { dbUtils } from "@/lib/indexedDB";

const updateWorks = jest.fn();
const updateTags = jest.fn();

jest.mock("@/navigation", () => ({
  Link: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
  useRouter: () => ({
    back: jest.fn(),
  }),
}));

jest.mock("next-intl", () => ({
  useTranslations:
    (namespace: string) =>
    (key: string, values?: Record<string, string | number>) =>
      typeof values?.defaultMessage === "string"
        ? values.defaultMessage
        : `${namespace}.${key}`,
}));

jest.mock("@/components/WorkTypeManager", () => function WorkTypeManager() {
  return <div data-testid="work-type-manager" />;
});

jest.mock(
  "@/components/CustomEpisodeTypeManager",
  () =>
    function CustomEpisodeTypeManager() {
      return <div data-testid="custom-episode-type-manager" />;
    }
);

jest.mock("@/components/PlatformInfo", () => function PlatformInfo() {
  return <div data-testid="platform-info" />;
});

jest.mock("@/components/HelpGuide", () => function HelpGuide() {
  return <div data-testid="help-guide" />;
});

jest.mock("@/components/Logo", () => function Logo() {
  return <span>WatchedIt</span>;
});

jest.mock("@/components/ThemeProvider", () => ({
  useTheme: () => ({
    theme: "light",
    setTheme: jest.fn(),
    systemTheme: "light",
  }),
}));

jest.mock("@/store/useWorkStore", () => ({
  useWorkStore: () => ({
    works: [
      { id: "1", title: "One", status: "進行中", episodes: [] },
      { id: "2", title: "Two", status: "已完結", episodes: [] },
    ],
    tags: [{ id: 1, name: "Tag" }],
    updateWorks,
    updateTags,
  }),
}));

jest.mock("@/lib/cloudStorage", () => ({
  cloudStorage: {
    setConfig: jest.fn(),
    testConnection: jest.fn(),
    uploadData: jest.fn(),
    downloadData: jest.fn(),
    getLastSyncTime: jest.fn().mockReturnValue(null),
    shouldSync: jest.fn().mockReturnValue(false),
  },
}));

jest.mock("@/lib/indexedDB", () => ({
  dbUtils: {
    exportData: jest.fn(),
    importData: jest.fn(),
    clearAll: jest.fn().mockResolvedValue(undefined),
  },
}));

jest.mock("@/lib/pwa", () => ({
  pwaService: {
    getPlatformInfo: jest.fn().mockReturnValue({
      isPWA: false,
      isMobile: false,
      isIOS: false,
      isAndroid: false,
      isDesktop: true,
    }),
    requestNotificationPermission: jest.fn(),
    checkForUpdate: jest.fn(),
    resetInstallPrompt: jest.fn(),
  },
}));

const mockedCloudStorage = cloudStorage as jest.Mocked<typeof cloudStorage>;

const openDataSection = async (
  user: ReturnType<typeof userEvent.setup>
) => {
  await user.click(screen.getByRole("tab", { name: "資料與同步" }));
};

describe("SettingsPage", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
    localStorage.clear();
  });

  afterEach(() => {
    act(() => {
      jest.runOnlyPendingTimers();
    });
    jest.useRealTimers();
  });

  it("groups settings into focused sections", async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

    render(<SettingsPage />);

    expect(
      screen.getByRole("tablist", { name: "設定分類" })
    ).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "一般" })).toHaveAttribute(
      "aria-selected",
      "true"
    );
    expect(screen.getByText("外觀設定")).toBeInTheDocument();
    expect(screen.queryByText("資料管理")).not.toBeInTheDocument();

    await openDataSection(user);

    expect(screen.getByRole("tab", { name: "資料與同步" })).toHaveAttribute(
      "aria-selected",
      "true"
    );
    expect(screen.getByText("資料管理")).toBeInTheDocument();
    expect(screen.queryByText("外觀設定")).not.toBeInTheDocument();

    await user.click(screen.getByRole("tab", { name: "管理" }));

    expect(screen.getByText("作品類型管理")).toBeInTheDocument();
    expect(screen.queryByText("資料管理")).not.toBeInTheDocument();

    await user.click(screen.getByRole("tab", { name: "關於" }));

    expect(screen.getByText("關於 WatchedIt")).toBeInTheDocument();
    expect(screen.getByTestId("platform-info")).toBeInTheDocument();
  });

  it("confirms clearing all data with an inline dialog", async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    const confirmSpy = jest.spyOn(window, "confirm").mockReturnValue(false);

    render(<SettingsPage />);

    await openDataSection(user);
    await user.click(screen.getByRole("button", { name: "清除所有資料" }));

    expect(
      await screen.findByRole("alertdialog", { name: "清除所有資料" })
    ).toBeInTheDocument();
    expect(confirmSpy).not.toHaveBeenCalled();
    expect(dbUtils.clearAll).not.toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: "確認清除" }));

    await waitFor(() => expect(dbUtils.clearAll).toHaveBeenCalled());
    expect(updateWorks).toHaveBeenCalledWith([]);
    expect(updateTags).toHaveBeenCalledWith([]);
    expect(await screen.findByText("資料已清除")).toBeInTheDocument();

    confirmSpy.mockRestore();
  });

  it("normalizes and persists the cloud endpoint after a successful connection test", async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    mockedCloudStorage.testConnection.mockResolvedValue({
      success: true,
      message: "ok",
    });

    render(<SettingsPage />);

    await openDataSection(user);
    await user.selectOptions(screen.getByLabelText("儲存模式"), "cloud");
    const endpointInput = screen.getByLabelText("雲端端點");
    await user.type(endpointInput, " https://sync.example.test/cloud/// ");
    await user.click(screen.getByRole("button", { name: "測試連接" }));

    await waitFor(() =>
      expect(mockedCloudStorage.testConnection).toHaveBeenCalledWith(
        "https://sync.example.test/cloud"
      )
    );
    expect(mockedCloudStorage.setConfig).toHaveBeenCalledWith({
      endpoint: "https://sync.example.test/cloud",
      apiKey: undefined,
    });
    await waitFor(() =>
      expect(endpointInput).toHaveValue("https://sync.example.test/cloud")
    );
    expect(JSON.parse(localStorage.getItem("watchedit_settings") ?? "{}"))
      .toMatchObject({
        storageMode: "cloud",
        cloudEndpoint: "https://sync.example.test/cloud",
      });
  });

  it("applies the current cloud endpoint before manual upload", async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    mockedCloudStorage.uploadData.mockResolvedValue({
      success: true,
      message: "ok",
    });

    render(<SettingsPage />);

    await openDataSection(user);
    await user.selectOptions(screen.getByLabelText("儲存模式"), "cloud");
    await user.type(
      screen.getByLabelText("雲端端點"),
      " https://sync.example.test/cloud/ "
    );
    await user.click(screen.getByRole("button", { name: "同步到雲端" }));

    await waitFor(() =>
      expect(mockedCloudStorage.setConfig).toHaveBeenCalledWith({
        endpoint: "https://sync.example.test/cloud",
        apiKey: undefined,
      })
    );
    expect(mockedCloudStorage.uploadData).toHaveBeenCalled();
  });
});
