import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import TestConfigPage from "../page";

describe("TestConfigPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn().mockResolvedValue({
      status: 200,
      json: jest.fn().mockResolvedValue({ ok: true }),
    }) as jest.Mock;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("shows API connection results inline instead of using browser alerts", async () => {
    const user = userEvent.setup();
    const alertSpy = jest.spyOn(window, "alert").mockImplementation(() => {});
    const logSpy = jest.spyOn(console, "log").mockImplementation(() => {});

    render(<TestConfigPage />);

    await user.click(screen.getByRole("button", { name: "測試 API 連接" }));

    await waitFor(() =>
      expect(global.fetch).toHaveBeenCalledWith("/api/search/anime?query=test")
    );
    expect(alertSpy).not.toHaveBeenCalled();
    expect(logSpy).not.toHaveBeenCalled();
    expect(
      screen.getByRole("status", { name: "API 連接結果" })
    ).toHaveTextContent("API 連接成功！回應狀態: 200");
  });
});
