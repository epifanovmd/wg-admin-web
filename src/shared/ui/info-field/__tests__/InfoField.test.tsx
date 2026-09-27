import { render, screen } from "@testing-library/react";
import * as React from "react";

import { InfoField } from "../InfoField";

describe("InfoField", () => {
  it("renders zero as a value instead of the empty placeholder", () => {
    render(<InfoField label="Остаток" value={0} />);

    expect(screen.getByText("0")).toBeInTheDocument();
    expect(screen.queryByText("—")).toBeNull();
  });

  it("shows the empty text for nothing-to-render values", () => {
    render(<InfoField label="Телефон" value="" emptyText="не указан" />);

    expect(screen.getByText("не указан")).toBeInTheDocument();
  });
});
