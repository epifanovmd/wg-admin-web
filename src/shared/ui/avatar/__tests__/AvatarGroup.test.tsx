import { render, screen } from "@testing-library/react";

import { Avatar } from "../Avatar";
import { AvatarGroup } from "../AvatarGroup";

describe("AvatarGroup", () => {
  it("keeps child identity by key when children are reordered", () => {
    const { rerender } = render(
      <AvatarGroup>
        <Avatar key="a" name="Anna" />
        <Avatar key="b" name="Boris" />
      </AvatarGroup>,
    );
    const anna = screen.getByText("A");

    rerender(
      <AvatarGroup>
        <Avatar key="b" name="Boris" />
        <Avatar key="a" name="Anna" />
      </AvatarGroup>,
    );

    expect(screen.getByText("A")).toBe(anna);
  });

  it("renders an accessible overflow counter", () => {
    render(
      <AvatarGroup max={1}>
        <Avatar name="Anna" />
        <Avatar name="Boris" />
        <Avatar name="Ciril" />
      </AvatarGroup>,
    );

    expect(screen.getByLabelText("ещё 2")).toHaveTextContent("+2");
  });
});
