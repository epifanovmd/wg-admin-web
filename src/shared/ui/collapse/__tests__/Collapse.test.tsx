import { fireEvent, render, screen } from "@testing-library/react";
import * as React from "react";

import { Collapse } from "../Collapse";

describe("Collapse", () => {
  it("wires trigger and region with aria attributes and toggles the content", () => {
    render(
      <Collapse>
        <Collapse.Trigger>Подробнее</Collapse.Trigger>
        <Collapse.Content>Текст</Collapse.Content>
      </Collapse>,
    );

    const trigger = screen.getByRole("button", { name: "Подробнее" });

    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByText("Текст")).toBeNull();

    fireEvent.click(trigger);

    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("region", { name: "Подробнее" })).toHaveTextContent(
      "Текст",
    );
  });

  it("keeps the content mounted but hidden with keepMounted", () => {
    render(
      <Collapse>
        <Collapse.Trigger>Подробнее</Collapse.Trigger>
        <Collapse.Content keepMounted>Текст</Collapse.Content>
      </Collapse>,
    );

    const content = screen.getByText("Текст");

    expect(content).toBeInTheDocument();
    expect(content.closest('[role="region"]')).toHaveAttribute(
      "aria-hidden",
      "true",
    );
  });
});
