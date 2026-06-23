import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import CloudSyncStatus from "../CloudSyncStatus";

const mockTranslations: Record<string, string> = {
  "CloudSyncStatus.title": "Cloud sync",
  "CloudSyncStatus.badges.needsSync": "Needs sync",
  "CloudSyncStatus.labels.lastSync": "Last sync:",
  "CloudSyncStatus.labels.neverSynced": "Never synced",
  "CloudSyncStatus.buttons.syncNow": "Sync now",
  "CloudSyncStatus.buttons.syncing": "Syncing...",
  "CloudSyncStatus.messages.success": "Sync completed.",
  "CloudSyncStatus.messages.error": "Sync failed: {error}",
  "CloudSyncStatus.messages.errorFallback": "Sync failed.",
  "CloudSyncStatus.messages.needsSync": "Sync to keep your data up to date.",
  "CloudSyncStatus.messages.upToDate": "Data is up to date.",
};

jest.mock("next-intl", () => ({
  useLocale: () => "en",
  useTranslations:
    (namespace: string) =>
    (key: string, values?: Record<string, string | number>) => {
      const template = mockTranslations[`${namespace}.${key}`] ?? `${namespace}.${key}`;

      return Object.entries(values ?? {}).reduce(
        (message, [name, value]) =>
          message.replace(new RegExp(`{${name}}`, "g"), String(value)),
        template
      );
    },
}));

const mockUseCloudSync = jest.fn();
jest.mock("@/hooks/useCloudSync", () => ({
  useCloudSync: () => mockUseCloudSync(),
}));

const baseCloudSyncState = {
  isSyncing: false,
  lastSync: null,
  shouldSync: true,
  error: null,
  sync: jest.fn(),
  hasConfig: true,
};

describe("CloudSyncStatus", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(window, "alert").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("does not render when cloud sync is not configured", () => {
    mockUseCloudSync.mockReturnValue({
      ...baseCloudSyncState,
      hasConfig: false,
    });

    const { container } = render(<CloudSyncStatus />);

    expect(container).toBeEmptyDOMElement();
  });

  it("shows inline success feedback instead of browser alerts", async () => {
    const user = userEvent.setup();
    const sync = jest.fn().mockResolvedValue({ success: true });
    mockUseCloudSync.mockReturnValue({
      ...baseCloudSyncState,
      sync,
    });

    render(<CloudSyncStatus />);

    await user.click(screen.getByRole("button", { name: "Sync now" }));

    expect(sync).toHaveBeenCalled();
    expect(window.alert).not.toHaveBeenCalled();
    expect(screen.getByRole("status")).toHaveTextContent("Sync completed.");
  });

  it("shows inline error feedback instead of browser alerts", async () => {
    const user = userEvent.setup();
    const sync = jest.fn().mockResolvedValue({
      success: false,
      error: "Network unavailable",
    });
    mockUseCloudSync.mockReturnValue({
      ...baseCloudSyncState,
      sync,
    });

    render(<CloudSyncStatus />);

    await user.click(screen.getByRole("button", { name: "Sync now" }));

    expect(window.alert).not.toHaveBeenCalled();
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Sync failed: Network unavailable"
    );
  });

  it("uses the sync result error before hook state updates", async () => {
    const user = userEvent.setup();
    const sync = jest.fn().mockResolvedValue({
      success: false,
      error: "Remote service unavailable",
    });
    mockUseCloudSync.mockReturnValue({
      ...baseCloudSyncState,
      error: null,
      sync,
    });

    render(<CloudSyncStatus />);

    await user.click(screen.getByRole("button", { name: "Sync now" }));

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Sync failed: Remote service unavailable"
    );
  });
});
