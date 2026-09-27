import { render, screen } from "@testing-library/react";

import { Progress } from "../Progress";

describe("Progress", () => {
  it("exposes the rounded percentage", () => {
    render(<Progress value={0.456} />);

    const bar = screen.getByRole("progressbar");

    expect(bar).toHaveAttribute("aria-valuenow", "46");
    expect(bar.firstElementChild).toHaveStyle({ width: "46%" });
  });

  it("clamps out-of-range values", () => {
    render(<Progress value={1.5} />);

    expect(screen.getByRole("progressbar")).toHaveAttribute(
      "aria-valuenow",
      "100",
    );
  });

  it("works without value when indeterminate", () => {
    render(<Progress indeterminate />);

    expect(screen.getByRole("progressbar")).not.toHaveAttribute(
      "aria-valuenow",
    );
  });
});
