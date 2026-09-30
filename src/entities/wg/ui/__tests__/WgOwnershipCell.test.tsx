import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { WgOwnershipCell } from "../WgOwnershipCell";

describe("WgOwnershipCell", () => {
  it("владелец и другой создатель", () => {
    render(<WgOwnershipCell owner="Блохин" creator="Админ" />);

    expect(screen.getByText("Блохин")).toBeTruthy();
    expect(screen.getByText("создал Админ")).toBeTruthy();
  });

  it("создатель совпадает с владельцем — одна строка; владельца нет — подпись", () => {
    const view = render(<WgOwnershipCell owner="Блохин" creator="Блохин" />);

    expect(screen.queryByText(/создал/)).toBeNull();
    view.rerender(<WgOwnershipCell owner={null} creator="Блохин" />);
    expect(screen.getByText("не назначен")).toBeTruthy();
    expect(screen.getByText("создал Блохин")).toBeTruthy();
  });
});
