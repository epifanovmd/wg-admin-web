import { fireEvent, render, screen } from "@testing-library/react";
import * as React from "react";
import { vi } from "vitest";

import { Textarea } from "../Textarea";

describe("Textarea", () => {
  it("forwards ref, native props and exposes root data attributes", () => {
    const ref = React.createRef<HTMLTextAreaElement>();

    render(
      <Textarea
        aria-label="Bio"
        className="textarea-class"
        defaultValue="hello"
        name="bio"
        ref={ref}
        size="lg"
        wrapperClassName="wrapper-class"
      />,
    );

    const textarea = screen.getByRole("textbox", { name: "Bio" });
    const root = textarea.closest('[data-slot="input-root"]');

    expect(ref.current).toBe(textarea);
    expect(textarea).toHaveAttribute("name", "bio");
    expect(textarea).toHaveClass("textarea-class");
    expect(textarea).toHaveAttribute("data-slot", "input");
    expect(root).toHaveClass("wrapper-class");
    expect(root).toHaveAttribute("data-has-value", "true");
    expect(root).toHaveAttribute("data-size", "lg");
  });

  it("uses a valid vertical resize class when autosize is off", () => {
    render(<Textarea aria-label="Fixed" autoResize={false} />);

    const textarea = screen.getByRole("textbox", { name: "Fixed" });

    expect(textarea).toHaveClass("resize-y");
    expect(textarea).not.toHaveClass("resize-vertical");
  });

  it("derives aria-invalid from the error variant", () => {
    const view = render(<Textarea aria-label="Invalid" variant="error" />);
    const textarea = screen.getByRole("textbox", { name: "Invalid" });

    expect(textarea).toHaveAttribute("aria-invalid", "true");

    view.rerender(
      <Textarea aria-invalid="false" aria-label="Invalid" variant="error" />,
    );
    expect(textarea).toHaveAttribute("aria-invalid", "false");
  });

  it("tracks the uncontrolled value in the counter and data-has-value", () => {
    const onChange = vi.fn();

    render(
      <Textarea
        aria-label="Note"
        maxLength={10}
        onChange={onChange}
        showCount
      />,
    );

    const textarea = screen.getByRole("textbox", { name: "Note" });
    const root = textarea.closest('[data-slot="input-root"]');
    const counter = screen.getByText("0 / 10");

    expect(root).toHaveAttribute("data-has-value", "false");
    expect(counter).toHaveAttribute("aria-live", "polite");
    expect(textarea).toHaveAttribute("aria-describedby", counter.id);

    fireEvent.change(textarea, { target: { value: "hello" } });

    expect(onChange).toHaveBeenCalledOnce();
    expect(screen.getByText("5 / 10")).toBeInTheDocument();
    expect(root).toHaveAttribute("data-has-value", "true");
  });

  it("reflects a controlled value in the counter", () => {
    const view = render(
      <Textarea aria-label="Controlled" showCount value="abc" />,
    );

    expect(screen.getByText("3")).toBeInTheDocument();

    view.rerender(<Textarea aria-label="Controlled" showCount value="" />);
    expect(screen.getByText("0")).toBeInTheDocument();
  });

  it("merges the counter into an existing aria-describedby", () => {
    render(
      <Textarea
        aria-describedby="hint"
        aria-label="Described"
        showCount
        value=""
      />,
    );

    const textarea = screen.getByRole("textbox", { name: "Described" });
    const counter = screen.getByText("0");

    expect(textarea).toHaveAttribute("aria-describedby", `hint ${counter.id}`);
  });

  it("supports minRows as an alias of rows", () => {
    render(<Textarea aria-label="Rows" minRows={5} />);

    expect(screen.getByRole("textbox", { name: "Rows" })).toHaveAttribute(
      "rows",
      "5",
    );
  });

  it("autosizes to its content up to maxRows", () => {
    render(
      <Textarea
        aria-label="Auto"
        defaultValue=""
        minRows={1}
        maxRows={2}
        style={{
          boxSizing: "border-box",
          lineHeight: "20px",
          paddingTop: "8px",
          paddingBottom: "8px",
        }}
      />,
    );

    const textarea = screen.getByRole("textbox", { name: "Auto" });

    Object.defineProperty(textarea, "scrollHeight", {
      configurable: true,
      value: 36,
    });
    fireEvent.input(textarea, { target: { value: "one" } });
    expect(textarea.style.height).toBe("36px");
    expect(textarea.style.overflowY).toBe("hidden");

    Object.defineProperty(textarea, "scrollHeight", {
      configurable: true,
      value: 120,
    });
    fireEvent.input(textarea, { target: { value: "one\ntwo\nthree\nfour" } });
    expect(textarea.style.height).toBe("56px");
    expect(textarea.style.overflowY).toBe("auto");
  });

  describe("авторост", () => {
    const setScrollHeight = (element: HTMLElement, value: number) =>
      Object.defineProperty(element, "scrollHeight", {
        configurable: true,
        value,
      });

    const BOX_STYLE = {
      boxSizing: "border-box",
      lineHeight: "20px",
      paddingTop: "8px",
      paddingBottom: "8px",
      borderTopWidth: "1px",
      borderBottomWidth: "1px",
      borderStyle: "solid",
    } as const;

    it("учитывает рамку при border-box: без лишнего скролла на последней строке", () => {
      render(
        <Textarea
          aria-label="Box"
          defaultValue=""
          minRows={1}
          maxRows={4}
          style={BOX_STYLE}
        />,
      );

      const textarea = screen.getByRole("textbox", { name: "Box" });

      setScrollHeight(textarea, 56);
      fireEvent.input(textarea, { target: { value: "one\ntwo" } });

      expect(textarea.style.height).toBe("58px");
      expect(textarea.style.overflowY).toBe("hidden");

      setScrollHeight(textarea, 200);
      fireEvent.input(textarea, { target: { value: "много строк" } });

      // 4 строки по 20px + отступы 16px + рамка 2px
      expect(textarea.style.height).toBe("98px");
      expect(textarea.style.overflowY).toBe("auto");
    });

    it("не становится ниже minRows", () => {
      render(
        <Textarea
          aria-label="Min"
          defaultValue=""
          minRows={3}
          maxRows={6}
          style={BOX_STYLE}
        />,
      );

      const textarea = screen.getByRole("textbox", { name: "Min" });

      setScrollHeight(textarea, 20);
      fireEvent.input(textarea, { target: { value: "a" } });

      // 3 строки по 20px + отступы 16px + рамка 2px
      expect(textarea.style.height).toBe("78px");
    });

    it("maxRows={Infinity} растёт без ограничения и без скролла", () => {
      render(
        <Textarea
          aria-label="Unbounded"
          defaultValue=""
          maxRows={Infinity}
          style={BOX_STYLE}
        />,
      );

      const textarea = screen.getByRole("textbox", { name: "Unbounded" });

      setScrollHeight(textarea, 1000);
      fireEvent.input(textarea, { target: { value: "очень много" } });

      expect(textarea.style.height).toBe("1002px");
      expect(textarea.style.overflowY).toBe("hidden");
    });
  });

  it('resize="vertical" разрешает ручное растягивание и при авторосте', () => {
    render(<Textarea aria-label="Resizable" resize="vertical" />);

    expect(screen.getByRole("textbox", { name: "Resizable" })).toHaveClass(
      "resize-y",
    );
  });

  it("clearable очищает значение, возвращает фокус и зовёт onChange и onClear", () => {
    const onChange = vi.fn();
    const onClear = vi.fn();

    render(
      <Textarea
        aria-label="Clear"
        defaultValue="текст"
        clearable
        onChange={onChange}
        onClear={onClear}
      />,
    );

    const textarea = screen.getByRole("textbox", { name: "Clear" });

    fireEvent.click(screen.getByRole("button", { name: "Очистить" }));

    expect(textarea).toHaveValue("");
    expect(textarea).toHaveFocus();
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onClear).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("button", { name: "Очистить" })).toBeNull();
  });

  it("без значения, при disabled и readOnly кнопки очистки нет", () => {
    const { rerender } = render(
      <Textarea aria-label="Empty" defaultValue="" clearable />,
    );

    expect(screen.queryByRole("button", { name: "Очистить" })).toBeNull();

    rerender(<Textarea aria-label="Empty" value="x" clearable readOnly />);
    expect(screen.queryByRole("button", { name: "Очистить" })).toBeNull();
  });

  it("onSubmitShortcut срабатывает на Ctrl/Cmd+Enter, а Enter переносит строку", () => {
    const onSubmit = vi.fn();
    const onKeyDown = vi.fn();

    render(
      <Textarea
        aria-label="Submit"
        onSubmitShortcut={onSubmit}
        onKeyDown={onKeyDown}
      />,
    );

    const textarea = screen.getByRole("textbox", { name: "Submit" });

    fireEvent.keyDown(textarea, { key: "Enter" });
    expect(onSubmit).not.toHaveBeenCalled();

    fireEvent.keyDown(textarea, { key: "Enter", ctrlKey: true });
    fireEvent.keyDown(textarea, { key: "Enter", metaKey: true });

    expect(onSubmit).toHaveBeenCalledTimes(2);
    expect(onKeyDown).toHaveBeenCalledTimes(3);
  });
});
