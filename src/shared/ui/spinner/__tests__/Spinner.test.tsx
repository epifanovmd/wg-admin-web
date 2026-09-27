import { render, screen } from "@testing-library/react";

import { Spinner } from "../Spinner";

describe("Spinner", () => {
  it("renders an inline span with a localized fallback label", () => {
    const { container } = render(<Spinner />);

    expect(container.firstElementChild?.tagName).toBe("SPAN");
    expect(screen.getByRole("status")).toHaveTextContent("Загрузка…");
  });

  it("does not duplicate the announcement when a visible label exists", () => {
    render(<Spinner label="Сохраняем" />);

    expect(screen.getByRole("status")).toHaveTextContent(/^Сохраняем$/);
  });
});
