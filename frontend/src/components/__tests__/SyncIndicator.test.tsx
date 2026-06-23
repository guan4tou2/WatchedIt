import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import SyncIndicator from "../SyncIndicator";

const mockTranslations: Record<string, string> = {
  "SyncIndicator.states.syncing": "Syncing with cloud...",
  "SyncIndicator.states.error": "Cloud sync failed: {error}",
  "SyncIndicator.states.needsSync": "Cloud sync recommended",
  "SyncIndicator.states.synced": "Cloud data is synced",
};

jest.mock("next-intl", () => ({
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
  shouldSync: false,
  error: null,
  hasConfig: true,
};

describe("SyncIndicator", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("does not render when cloud sync is not configured", () => {
    mockUseCloudSync.mockReturnValue({
      ...baseCloudSyncState,
      hasConfig: false,
    });

    const { container } = render(<SyncIndicator />);

    expect(container).toBeEmptyDOMElement();
  });

  it("labels the syncing state for assistive technology", () => {
    mockUseCloudSync.mockReturnValue({
      ...baseCloudSyncState,
      isSyncing: true,
    });

    render(<SyncIndicator />);

    const indicator = screen.getByRole("status", {
      name: "Syncing with cloud...",
    });
    expect(indicator).toHaveAttribute("title", "Syncing with cloud...");
    expect(indicator.querySelector("svg")).toHaveClass("animate-spin");
  });

  it("labels sync errors with the specific error reason", () => {
    mockUseCloudSync.mockReturnValue({
      ...baseCloudSyncState,
      error: "Network unavailable",
    });

    render(<SyncIndicator />);

    const indicator = screen.getByRole("status", {
      name: "Cloud sync failed: Network unavailable",
    });
    expect(indicator).toHaveAttribute(
      "title",
      "Cloud sync failed: Network unavailable"
    );
    expect(indicator.querySelector("svg")).toHaveClass("text-red-500");
  });

  it("labels the needs-sync state", () => {
    mockUseCloudSync.mockReturnValue({
      ...baseCloudSyncState,
      shouldSync: true,
    });

    render(<SyncIndicator />);

    const indicator = screen.getByRole("status", {
      name: "Cloud sync recommended",
    });
    expect(indicator).toHaveAttribute("title", "Cloud sync recommended");
    expect(indicator.querySelector("svg")).toHaveClass("text-orange-500");
  });

  it("labels the synced state", () => {
    mockUseCloudSync.mockReturnValue(baseCloudSyncState);

    render(<SyncIndicator />);

    const indicator = screen.getByRole("status", {
      name: "Cloud data is synced",
    });
    expect(indicator).toHaveAttribute("title", "Cloud data is synced");
    expect(indicator.querySelector("svg")).toHaveClass("opacity-50");
  });
});
