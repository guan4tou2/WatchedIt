import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import WorkDetailClient from "../WorkDetailClient";

const push = jest.fn();
const getWork = jest.fn();
const updateWork = jest.fn();
const deleteWork = jest.fn();
const searchParams = {
  get: (key: string) => (key === "id" ? "work-1" : null),
};

jest.mock("next/navigation", () => ({
  useSearchParams: () => searchParams,
}));

jest.mock("@/navigation", () => ({
  useRouter: () => ({
    back: jest.fn(),
    push,
  }),
}));

jest.mock("next-intl", () => ({
  useLocale: () => "zh-TW",
  useTranslations:
    (namespace: string) =>
    (key: string, values?: Record<string, string | number>) =>
      typeof values?.defaultMessage === "string"
        ? values.defaultMessage
        : `${namespace}.${key}`,
}));

jest.mock(
  "@/components/EpisodeManager",
  () =>
    function EpisodeManager({
      onEpisodesChange,
    }: {
      onEpisodesChange: (episodes: Array<{ id: string; number: number; title: string }>) => void;
    }) {
      return (
        <button
          type="button"
          onClick={() =>
            onEpisodesChange([{ id: "ep-1", number: 1, title: "第一集" }])
          }
        >
          模擬集數變更
        </button>
      );
    }
);

jest.mock("@/components/WorkEditForm", () => function WorkEditForm() {
  return <div data-testid="work-edit-form" />;
});

jest.mock("@/store/useWorkStore", () => {
  const store = () => ({
    getWork,
    updateWork,
    deleteWork,
    loading: false,
  });

  store.getState = () => ({
    fetchStats: jest.fn(),
  });

  return { useWorkStore: store };
});

const mockWork = {
  id: "work-1",
  title: "測試作品",
  type: "動畫",
  status: "進行中",
  year: 2024,
  rating: 8,
  episodes: [],
  tags: [],
  reminder_enabled: false,
  date_added: "2024-01-01T00:00:00.000Z",
};

describe("WorkDetailClient", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    getWork.mockResolvedValue(mockWork);
    updateWork.mockResolvedValue(mockWork);
    deleteWork.mockResolvedValue(true);
  });

  it("confirms work deletion with an inline dialog", async () => {
    const user = userEvent.setup();
    const confirmSpy = jest.spyOn(window, "confirm").mockReturnValue(false);

    render(<WorkDetailClient />);

    expect(await screen.findByText("測試作品")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "刪除" }));

    expect(
      await screen.findByRole("alertdialog", { name: "刪除作品" })
    ).toBeInTheDocument();
    expect(screen.getByText("此操作會永久刪除「測試作品」，且無法復原。")).toBeInTheDocument();
    expect(confirmSpy).not.toHaveBeenCalled();
    expect(deleteWork).not.toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: "取消" }));
    expect(deleteWork).not.toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: "刪除" }));
    await user.click(screen.getByRole("button", { name: "確認刪除" }));

    await waitFor(() => expect(deleteWork).toHaveBeenCalledWith("work-1"));
    expect(push).toHaveBeenCalledWith("/");

    confirmSpy.mockRestore();
  });

  it("updates episodes without logging work details to the console", async () => {
    const user = userEvent.setup();
    const logSpy = jest.spyOn(console, "log").mockImplementation(() => {});

    render(<WorkDetailClient />);

    expect(await screen.findByText("測試作品")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "模擬集數變更" }));

    await waitFor(() =>
      expect(updateWork).toHaveBeenCalledWith("work-1", {
        episodes: [{ id: "ep-1", number: 1, title: "第一集" }],
      })
    );
    expect(logSpy).not.toHaveBeenCalled();
  });
});
