import { fireEvent, render, screen } from "@testing-library/react";
import * as React from "react";

import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  useCommandShortcut,
} from "..";

beforeAll(() => {
  Element.prototype.scrollIntoView = vi.fn();
});

describe("Command", () => {
  it("filters items by input and fires onSelect", () => {
    const onSelect = vi.fn();

    render(
      <Command>
        <CommandInput />
        <CommandList>
          <CommandEmpty />
          <CommandGroup heading="Разделы">
            <CommandItem onSelect={onSelect}>Профиль</CommandItem>
            <CommandItem>Настройки</CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>,
    );

    fireEvent.change(screen.getByRole("combobox"), {
      target: { value: "проф" },
    });

    expect(screen.getByText("Профиль")).toBeInTheDocument();
    expect(screen.queryByText("Настройки")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("option", { name: "Профиль" }));

    expect(onSelect).toHaveBeenCalledWith("Профиль");
  });

  it("shows the default empty state and clears the query", () => {
    render(
      <Command>
        <CommandInput />
        <CommandList>
          <CommandEmpty />
          <CommandItem>Профиль</CommandItem>
        </CommandList>
      </Command>,
    );

    const input = screen.getByRole("combobox");

    fireEvent.change(input, { target: { value: "zzz" } });

    expect(screen.getByText("Ничего не найдено")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Очистить" }));

    expect(input).toHaveValue("");
    expect(screen.getByText("Профиль")).toBeInTheDocument();
  });
});

describe("CommandDialog + useCommandShortcut", () => {
  const Harness = () => {
    const [open, setOpen] = React.useState(false);

    useCommandShortcut(() => setOpen(prev => !prev));

    return (
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput />
        <CommandList>
          <CommandItem>Профиль</CommandItem>
        </CommandList>
      </CommandDialog>
    );
  };

  it("toggles on Ctrl+K and Cmd+K", () => {
    render(<Harness />);

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    fireEvent.keyDown(document, { key: "k", ctrlKey: true });

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Профиль" })).toBeInTheDocument();

    fireEvent.keyDown(document, { key: "k", metaKey: true });

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("ignores K without a modifier and detaches on unmount", () => {
    const onTrigger = vi.fn();
    const Probe = () => {
      useCommandShortcut(onTrigger);

      return null;
    };

    const { unmount } = render(<Probe />);

    fireEvent.keyDown(document, { key: "k" });
    fireEvent.keyDown(document, { key: "л", code: "KeyK", ctrlKey: true });

    expect(onTrigger).toHaveBeenCalledTimes(1);

    unmount();
    fireEvent.keyDown(document, { key: "k", ctrlKey: true });

    expect(onTrigger).toHaveBeenCalledTimes(1);
  });
});
