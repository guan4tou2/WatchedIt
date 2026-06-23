import { apiClient } from "../api";

jest.mock("../config", () => ({
  getApiBaseUrl: () => "https://api.example.test",
}));

describe("apiClient", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      statusText: "OK",
      json: jest.fn().mockResolvedValue({
        works: [],
        total: 0,
        page: 1,
        size: 20,
      }),
    }) as jest.Mock;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("does not log successful request and response metadata", async () => {
    const logSpy = jest.spyOn(console, "log").mockImplementation(() => {});

    await apiClient.getWorks();

    expect(global.fetch).toHaveBeenCalledWith(
      "https://api.example.test/works?",
      expect.objectContaining({
        headers: expect.objectContaining({
          "Content-Type": "application/json",
        }),
      })
    );
    expect(logSpy).not.toHaveBeenCalled();
  });
});
