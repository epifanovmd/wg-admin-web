import { fireEvent, render, screen } from "@testing-library/react";
import * as React from "react";

import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "..";

const openWithKeyboard = () => {
  fireEvent.keyDown(screen.getByRole("button", { name: "Действия" }), {
    key: "Enter",
  });
};

describe("DropdownMenu", () => {
  it("opens from the keyboard and selects an item", () => {
    const onSelect = vi.fn();

    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Действия</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onSelect={onSelect} shortcut="⌘E">
            Изменить
          </DropdownMenuItem>
          <DropdownMenuItem variant="destructive">Удалить</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );

    expect(screen.queryByRole("menu")).not.toBeInTheDocument();

    openWithKeyboard();

    const item = screen.getByRole("menuitem", { name: /Изменить/ });

    expect(screen.getByRole("menu")).toBeInTheDocument();
    expect(screen.getByText("⌘E")).toBeInTheDocument();

    fireEvent.click(item);

    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("toggles a checkbox item", () => {
    const Harness = () => {
      const [checked, setChecked] = React.useState(false);

      return (
        <DropdownMenu>
          <DropdownMenuTrigger>Действия</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuCheckboxItem
              checked={checked}
              onCheckedChange={setChecked}
            >
              Показывать сетку
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    };

    render(<Harness />);
    openWithKeyboard();

    const item = screen.getByRole("menuitemcheckbox", {
      name: "Показывать сетку",
    });

    expect(item).toHaveAttribute("aria-checked", "false");

    fireEvent.click(item);
    openWithKeyboard();

    expect(
      screen.getByRole("menuitemcheckbox", { name: "Показывать сетку" }),
    ).toHaveAttribute("aria-checked", "true");
  });
});
