jest.mock("next-intl/middleware", () => ({
  __esModule: true,
  default: jest.fn(() =>
    jest.fn((request: { nextUrl: URL }) => ({
      kind: "intl",
      pathname: request.nextUrl.pathname,
    }))
  ),
}));

jest.mock("next/server", () => ({
  NextResponse: {
    redirect: jest.fn((url: URL) => ({
      kind: "redirect",
      url: url.toString(),
    })),
    next: jest.fn(() => ({
      kind: "next",
    })),
  },
}));

const originalNodeEnv = process.env.NODE_ENV;

const loadMiddleware = async (nodeEnv: string) => {
  jest.resetModules();
  Object.defineProperty(process.env, "NODE_ENV", {
    value: nodeEnv,
    configurable: true,
  });

  const middlewareModule = await import("../middleware");
  const { default: createMiddleware } = await import("next-intl/middleware");
  const { NextResponse } = await import("next/server");

  return { middlewareModule, createMiddleware, NextResponse };
};

const requestFor = (url: string) => ({
  nextUrl: new URL(url),
  url,
});

describe("middleware route surface", () => {
  afterEach(() => {
    Object.defineProperty(process.env, "NODE_ENV", {
      value: originalNodeEnv,
      configurable: true,
    });
    jest.clearAllMocks();
  });

  it.each([
    ["http://localhost/test", "http://localhost/zh-TW"],
    ["http://localhost/test-anilist", "http://localhost/zh-TW"],
    ["http://localhost/local-test", "http://localhost/zh-TW"],
    ["http://localhost/episode-test", "http://localhost/zh-TW"],
    ["http://localhost/zh-TW/debug-init", "http://localhost/zh-TW"],
    ["http://localhost/en/debug-init", "http://localhost/en"],
  ])(
    "redirects development-only route %s in production",
    async (url, expectedRedirect) => {
      const { middlewareModule, NextResponse } = await loadMiddleware("production");

      const result = middlewareModule.default(requestFor(url) as never);

      expect(NextResponse.redirect).toHaveBeenCalledWith(
        new URL(expectedRedirect)
      );
      expect(result).toEqual({ kind: "redirect", url: expectedRedirect });
    }
  );

  it("keeps development-only routes available outside production", async () => {
    const { middlewareModule, createMiddleware, NextResponse } =
      await loadMiddleware("development");

    const result = middlewareModule.default(
      requestFor("http://localhost/test-anilist") as never
    );

    expect(NextResponse.redirect).not.toHaveBeenCalled();
    expect(NextResponse.next).toHaveBeenCalled();
    expect(createMiddleware).toHaveBeenCalled();
    expect(result).toEqual({ kind: "next" });
  });
});
