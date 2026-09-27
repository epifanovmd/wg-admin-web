import { render, screen } from "@testing-library/react";

import { Separator } from "../Separator";

describe("Separator", () => {
  it("is decorative by default", () => {
    render(<Separator />);

    expect(screen.queryByRole("separator")).toBeNull();
  });

  it("keeps separator semantics for the labeled variant", () => {
    render(<Separator label="или" decorative={false} />);

    expect(screen.getByRole("separator")).toHaveAttribute(
      "aria-orientation",
      "horizontal",
    );
    expect(screen.getByText("или")).toBeInTheDocument();
  });

  it("exposes vertical orientation", () => {
    render(<Separator orientation="vertical" decorative={false} />);

    expect(screen.getByRole("separator")).toHaveAttribute(
      "aria-orientation",
      "vertical",
    );
  });
});
