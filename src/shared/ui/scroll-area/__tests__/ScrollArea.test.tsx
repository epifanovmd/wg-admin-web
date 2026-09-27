import { render, screen } from "@testing-library/react";
import * as React from "react";

import { ScrollArea } from "..";

describe("ScrollArea", () => {
  it("renders children inside the viewport and forwards viewportRef", () => {
    const viewportRef = React.createRef<HTMLDivElement>();

    render(
      <ScrollArea className="h-40" viewportRef={viewportRef}>
        <p>Содержимое</p>
      </ScrollArea>,
    );

    const content = screen.getByText("Содержимое");

    expect(viewportRef.current).toHaveAttribute(
      "data-radix-scroll-area-viewport",
    );
    expect(viewportRef.current).toContainElement(content);
  });
});
