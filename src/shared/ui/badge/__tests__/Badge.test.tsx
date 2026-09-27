import { render, screen } from "@testing-library/react";

import { Badge } from "../Badge";
import { BadgeAnchor } from "../BadgeAnchor";

describe("Badge", () => {
  it("renders an inline span so it can live inside phrasing content", () => {
    const { container } = render(<Badge>New</Badge>);

    expect(container.firstElementChild?.tagName).toBe("SPAN");
  });

  it("caps numeric content with max", () => {
    render(<Badge max={99}>{150}</Badge>);

    expect(screen.getByText("99+")).toBeInTheDocument();
  });
});

describe("BadgeAnchor", () => {
  it("gives the dot an sr-only label", () => {
    render(
      <BadgeAnchor dot label="Есть новые">
        <button type="button">Bell</button>
      </BadgeAnchor>,
    );

    expect(screen.getByText("Есть новые")).toHaveClass("sr-only");
  });
});
