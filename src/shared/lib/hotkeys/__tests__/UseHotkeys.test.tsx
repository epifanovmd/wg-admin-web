import { fireEvent, render, screen } from "@testing-library/react";
import * as React from "react";
import { describe, expect, it, vi } from "vitest";

import { getHotkeyHandler } from "../get-hotkey-handler";
import { type HotkeyBinding, useHotkeys } from "../use-hotkeys";

interface ProbeProps {
  bindings: HotkeyBinding[];
  enabled?: boolean;
}

const Probe = ({ bindings, enabled }: ProbeProps) => {
  useHotkeys(bindings, { enabled });

  return <input aria-label="Поле" />;
};

describe("useHotkeys", () => {
  it("вызывает обработчик подходящего сочетания и отменяет действие браузера", () => {
    const onSave = vi.fn();
    const onOther = vi.fn();

    render(
      <Probe
        bindings={[
          ["mod+s", onSave],
          ["mod+b", onOther],
        ]}
      />,
    );

    const event = new KeyboardEvent("keydown", {
      key: "s",
      ctrlKey: true,
      bubbles: true,
      cancelable: true,
    });

    document.dispatchEvent(event);

    expect(onSave).toHaveBeenCalledTimes(1);
    expect(onOther).not.toHaveBeenCalled();
    expect(event.defaultPrevented).toBe(true);
  });

  it("массив сочетаний — альтернативы одного действия", () => {
    const onDelete = vi.fn();

    render(<Probe bindings={[[["backspace", "delete"], onDelete]]} />);

    fireEvent.keyDown(document, { key: "Backspace" });
    fireEvent.keyDown(document, { key: "Delete" });

    expect(onDelete).toHaveBeenCalledTimes(2);
  });

  it("по умолчанию игнорирует ввод в поля, allowInInputs — разрешает", () => {
    const onPlain = vi.fn();
    const onAllowed = vi.fn();

    render(
      <Probe
        bindings={[
          ["backspace", onPlain],
          ["mod+k", onAllowed, { allowInInputs: true }],
        ]}
      />,
    );

    const input = screen.getByRole("textbox", { name: "Поле" });

    fireEvent.keyDown(input, { key: "Backspace" });
    fireEvent.keyDown(input, { key: "k", metaKey: true });

    expect(onPlain).not.toHaveBeenCalled();
    expect(onAllowed).toHaveBeenCalledTimes(1);
  });

  it("preventDefault: false оставляет действие браузера", () => {
    render(<Probe bindings={[["f2", vi.fn(), { preventDefault: false }]]} />);

    const event = new KeyboardEvent("keydown", {
      key: "F2",
      bubbles: true,
      cancelable: true,
    });

    document.dispatchEvent(event);

    expect(event.defaultPrevented).toBe(false);
  });

  it("enabled: false снимает обработчик, размонтирование — тоже", () => {
    const onTrigger = vi.fn();
    const { rerender, unmount } = render(
      <Probe bindings={[["mod+k", onTrigger]]} enabled={false} />,
    );

    fireEvent.keyDown(document, { key: "k", ctrlKey: true });
    expect(onTrigger).not.toHaveBeenCalled();

    rerender(<Probe bindings={[["mod+k", onTrigger]]} />);
    fireEvent.keyDown(document, { key: "k", ctrlKey: true });
    expect(onTrigger).toHaveBeenCalledTimes(1);

    unmount();
    fireEvent.keyDown(document, { key: "k", ctrlKey: true });
    expect(onTrigger).toHaveBeenCalledTimes(1);
  });

  it("видит свежий обработчик без переподписки", () => {
    const calls: number[] = [];
    const Counter = () => {
      const [count, setCount] = React.useState(0);

      useHotkeys([["arrowup", () => calls.push(count)]]);

      return (
        <button type="button" onClick={() => setCount(prev => prev + 1)}>
          {count}
        </button>
      );
    };

    render(<Counter />);
    fireEvent.click(screen.getByRole("button"));
    fireEvent.keyDown(document, { key: "ArrowUp" });

    expect(calls).toEqual([1]);
  });

  it("target ограничивает сочетания элементом", () => {
    const onRename = vi.fn();
    const Scoped = () => {
      const ref = React.useRef<HTMLDivElement>(null);

      useHotkeys([["f2", onRename]], { target: ref });

      return (
        <>
          <div ref={ref} tabIndex={0} data-testid="area" />
          <button type="button">Снаружи</button>
        </>
      );
    };

    render(<Scoped />);

    fireEvent.keyDown(screen.getByRole("button"), { key: "F2" });
    expect(onRename).not.toHaveBeenCalled();

    fireEvent.keyDown(screen.getByTestId("area"), { key: "F2" });
    expect(onRename).toHaveBeenCalledTimes(1);
  });

  it("не срабатывает во время IME-композиции", () => {
    const onTrigger = vi.fn();

    render(<Probe bindings={[["enter", onTrigger]]} />);
    fireEvent.keyDown(document, { key: "Enter", isComposing: true });

    expect(onTrigger).not.toHaveBeenCalled();
  });
});

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
