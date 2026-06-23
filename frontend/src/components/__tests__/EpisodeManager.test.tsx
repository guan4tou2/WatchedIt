import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import EpisodeManager from "../EpisodeManager";
import { Episode } from "@/types";

jest.mock("@/lib/workTypeEpisodeMapping", () => ({
  workTypeEpisodeMappingStorage: {
    getEpisodeTypesForWorkType: jest.fn().mockReturnValue(["episode"]),
    getDefaultEpisodeTypeForWorkType: jest.fn().mockReturnValue("episode"),
  },
}));

jest.mock("@/lib/customEpisodeTypes", () => ({
  customEpisodeTypeStorage: {
    getTypeLabels: jest.fn().mockReturnValue({ episode: "正篇" }),
    getByName: jest.fn().mockReturnValue({
      name: "episode",
      label: "正篇",
      color: "#3B82F6",
    }),
  },
}));

const episodes: Episode[] = [
  {
    id: "ep-1",
    number: 1,
    title: "第一集",
    type: "episode",
    season: 1,
    watched: false,
  },
  {
    id: "ep-2",
    number: 2,
    title: "第二集",
    type: "episode",
    season: 1,
    watched: true,
  },
];

describe("EpisodeManager", () => {
  it("adds episodes without logging episode details to the console", async () => {
    const user = userEvent.setup();
    const onEpisodesChange = jest.fn();
    const logSpy = jest.spyOn(console, "log").mockImplementation(() => {});

    render(
      <EpisodeManager
        episodes={episodes}
        onEpisodesChange={onEpisodesChange}
        type="動畫"
      />
    );

    await user.click(screen.getByRole("button", { name: "新增集數" }));
    await user.type(screen.getByPlaceholderText("集數標題"), "第三集");
    await user.click(screen.getByRole("button", { name: "新增" }));

    expect(onEpisodesChange).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ number: 3, title: "第三集" }),
      ])
    );
    expect(logSpy).not.toHaveBeenCalled();
  });

  it("confirms single episode deletion with an accessible inline dialog", async () => {
    const user = userEvent.setup();
    const onEpisodesChange = jest.fn();

    render(
      <EpisodeManager
        episodes={episodes}
        onEpisodesChange={onEpisodesChange}
        type="動畫"
      />
    );

    await user.click(
      screen.getByRole("button", { name: "刪除第1季第1集" })
    );

    expect(
      await screen.findByRole("alertdialog", { name: "刪除集數" })
    ).toBeInTheDocument();
    expect(
      screen.getByText("將刪除第1季第1集「第一集」，且無法復原。")
    ).toBeInTheDocument();
    expect(onEpisodesChange).not.toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: "取消" }));
    expect(onEpisodesChange).not.toHaveBeenCalled();

    await user.click(
      screen.getByRole("button", { name: "刪除第1季第1集" })
    );
    await user.click(screen.getByRole("button", { name: "確認刪除" }));

    await waitFor(() =>
      expect(onEpisodesChange).toHaveBeenCalledWith([episodes[1]])
    );
  });

  it("confirms batch deletion with an inline dialog", async () => {
    const user = userEvent.setup();
    const onEpisodesChange = jest.fn();
    const confirmSpy = jest.spyOn(window, "confirm").mockReturnValue(false);

    render(
      <EpisodeManager
        episodes={episodes}
        onEpisodesChange={onEpisodesChange}
        type="動畫"
      />
    );

    await user.click(screen.getByRole("button", { name: "批量管理" }));
    await user.click(screen.getByRole("button", { name: "全選" }));
    await user.click(screen.getByRole("button", { name: "刪除" }));

    expect(
      await screen.findByRole("alertdialog", { name: "刪除集數" })
    ).toBeInTheDocument();
    expect(screen.getByText("將刪除已選擇的 2 個集數，且無法復原。")).toBeInTheDocument();
    expect(confirmSpy).not.toHaveBeenCalled();
    expect(onEpisodesChange).not.toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: "取消" }));
    expect(onEpisodesChange).not.toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: "刪除" }));
    await user.click(screen.getByRole("button", { name: "確認刪除" }));

    await waitFor(() => expect(onEpisodesChange).toHaveBeenCalledWith([]));

    confirmSpy.mockRestore();
  });
});
