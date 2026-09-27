import { fireEvent, render, screen } from "@testing-library/react";

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "..";

describe("ContextMenu", () => {
  it("opens on the contextmenu event and selects an item", () => {
    const onSelect = vi.fn();

    render(
      <ContextMenu>
        <ContextMenuTrigger>Область</ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem onSelect={onSelect}>Копировать</ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>,
    );

    expect(screen.queryByRole("menu")).not.toBeInTheDocument();

    fireEvent.contextMenu(screen.getByText("Область"));

    fireEvent.click(screen.getByRole("menuitem", { name: "Копировать" }));

    expect(onSelect).toHaveBeenCalledTimes(1);
  });
});
