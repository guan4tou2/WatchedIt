import { render, screen } from "@testing-library/react";
import WorkList from "../WorkList";

jest.mock("next-intl", () => ({
  useTranslations: (namespace: string) => (key: string) => `${namespace}.${key}`,
}));

jest.mock("@/navigation", () => ({
  Link: ({
    href,
    children,
    ...props
  }: {
    href: string;
    children: React.ReactNode;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

const defaultProps = {
  works: [],
  totalWorks: 0,
  isBatchMode: false,
  selectedWorkIds: new Set<string>(),
  onToggleSelection: jest.fn(),
  onQuickAdd: jest.fn(),
};

const renderWithIntl = (props = defaultProps) =>
  render(<WorkList {...props} />);

describe("WorkList", () => {
  it("offers a clear add-work action when the collection is empty", () => {
    renderWithIntl();

    expect(screen.getByText("WorkList.empty.title")).toBeInTheDocument();
    expect(screen.getByText("WorkList.empty.description")).toBeInTheDocument();

    const addLink = screen.getByRole("link", { name: "WorkList.empty.action" });
    expect(addLink).toHaveAttribute("href", "/works/new");
  });

  it("explains when filters have no matching works", () => {
    renderWithIntl({ ...defaultProps, totalWorks: 3 });

    expect(screen.getByText("WorkList.noResults.title")).toBeInTheDocument();
    expect(
      screen.getByText("WorkList.noResults.description")
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: "WorkList.empty.action" })
    ).not.toBeInTheDocument();
  });
});
