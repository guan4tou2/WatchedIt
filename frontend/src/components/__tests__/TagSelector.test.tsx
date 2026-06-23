import { fireEvent, render, screen } from "@testing-library/react";
import TagSelector from "../TagSelector";
import { Tag } from "@/types";

jest.mock("next-intl", () => ({
  useTranslations: (namespace: string) => (key: string) => `${namespace}.${key}`,
}));

const tags: Tag[] = [
  { id: 1, name: "Action", color: "#000" },
  { id: 2, name: "Drama", color: "#111" },
];

describe("TagSelector", () => {
  it("uses localized copy when no tags are selected", () => {
    render(
      <TagSelector availableTags={tags} selectedTags={[]} onTagsChange={jest.fn()} />
    );

    expect(screen.getByText("TagSelector.label")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "TagSelector.buttons.select" })
    ).toBeInTheDocument();
  });

  it("uses localized manage copy when tags are selected", () => {
    render(
      <TagSelector
        availableTags={tags}
        selectedTags={[tags[0]]}
        onTagsChange={jest.fn()}
      />
    );

    expect(
      screen.getByRole("button", { name: "TagSelector.buttons.manage" })
    ).toBeInTheDocument();
  });

  it("shows localized empty copy when every tag is already selected", () => {
    render(
      <TagSelector
        availableTags={tags}
        selectedTags={tags}
        onTagsChange={jest.fn()}
      />
    );

    fireEvent.click(
      screen.getByRole("button", { name: "TagSelector.buttons.manage" })
    );

    expect(screen.getByText("TagSelector.empty")).toBeInTheDocument();
  });
});
