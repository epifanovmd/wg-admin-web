import * as PopoverPrimitive from "@radix-ui/react-popover";
import { fireEvent, render, screen } from "@testing-library/react";

import { PopoverTrigger } from "..";
import { Popover } from "../Popover";
import { PopoverContent } from "../PopoverContent";

describe("Popover", () => {
  it("does not mutate the Radix Root export", () => {
    expect(Popover.Trigger).toBeDefined();
    expect(
      (PopoverPrimitive.Root as unknown as { Trigger?: unknown }).Trigger,
    ).toBeUndefined();
  });

  it("works in compound form", () => {
    render(
      <Popover>
        <Popover.Trigger>Открыть</Popover.Trigger>
        <Popover.Content>Панель</Popover.Content>
      </Popover>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Открыть" }));

    expect(screen.getByText("Панель")).toBeInTheDocument();
  });

  it("works in standalone form", () => {
    render(
      <Popover>
        <PopoverTrigger>Открыть</PopoverTrigger>
        <PopoverContent>Панель</PopoverContent>
      </Popover>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Открыть" }));

    expect(screen.getByText("Панель")).toBeInTheDocument();
  });
});
