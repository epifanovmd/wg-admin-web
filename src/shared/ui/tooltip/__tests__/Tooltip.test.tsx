import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { render, screen } from "@testing-library/react";

import { Tooltip } from "../Tooltip";

describe("Tooltip", () => {
  it("wraps plain-text children into a focusable trigger", () => {
    render(
      <TooltipPrimitive.Provider>
        <Tooltip content="Подсказка">Что это?</Tooltip>
      </TooltipPrimitive.Provider>,
    );

    expect(screen.getByText("Что это?")).toHaveAttribute("tabindex", "0");
  });

  it("uses an element child as the trigger itself", () => {
    render(
      <TooltipPrimitive.Provider>
        <Tooltip content="Подсказка">
          <button type="button">Кнопка</button>
        </Tooltip>
      </TooltipPrimitive.Provider>,
    );

    expect(screen.getByRole("button", { name: "Кнопка" })).toHaveAttribute(
      "data-state",
    );
  });
});
