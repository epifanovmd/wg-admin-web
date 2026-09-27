import { render, screen } from "@testing-library/react";

vi.mock("../../../spinner", () => ({
  Spinner: ({ size }: { size: string }) => (
    <span data-testid="spinner">{size}</span>
  ),
}));

import { SelectLoading } from "../SelectLoading";

describe("SelectLoading", () => {
  it("renders a medium spinner and custom class", () => {
    render(<SelectLoading className="custom" />);

    expect(screen.getByTestId("spinner")).toHaveTextContent("md");
    expect(screen.getByTestId("spinner").parentElement).toHaveClass("custom");
  });
});
