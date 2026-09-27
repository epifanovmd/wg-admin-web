import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { getHotkeyHandler } from "../get-hotkey-handler";

describe("getHotkeyHandler", () => {
  it("обрабатывает onKeyDown конкретного элемента", () => {
    const onSubmit = vi.fn();

    render(
      <textarea
        aria-label="Сообщение"
        onKeyDown={getHotkeyHandler([["mod+enter", onSubmit]])}
      />,
    );

    const textarea = screen.getByRole("textbox", { name: "Сообщение" });

    fireEvent.keyDown(textarea, { key: "Enter" });
    fireEvent.keyDown(textarea, { key: "Enter", ctrlKey: true });

    expect(onSubmit).toHaveBeenCalledTimes(1);
  });
});
