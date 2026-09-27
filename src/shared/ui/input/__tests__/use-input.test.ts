import { act, renderHook } from "@testing-library/react";
import * as React from "react";
import { vi } from "vitest";

import { useInput } from "../use-input";

type UseInputOptions = Parameters<typeof useInput>[0];

const createOptions = (
  overrides: Partial<UseInputOptions> = {},
): UseInputOptions => ({
  defaultValue: undefined,
  disabled: false,
  forwardedRef: null,
  hasValue: undefined,
  onChange: undefined,
  onClear: undefined,
  readOnly: false,
  type: "text",
  value: undefined,
  ...overrides,
});

const createChangeEvent = (
  input: HTMLInputElement,
): React.ChangeEvent<HTMLInputElement> =>
  ({
    currentTarget: input,
    target: input,
  }) as React.ChangeEvent<HTMLInputElement>;

describe("useInput", () => {
  it("tracks the presence of an uncontrolled value and forwards changes", () => {
    const onChange = vi.fn();
    const options = createOptions({ defaultValue: "initial", onChange });
    const { result } = renderHook(props => useInput(props), {
      initialProps: options,
    });
    const input = document.createElement("input");

    expect(result.current.hasValue).toBe(true);
    expect(result.current.inputType).toBe("text");
    expect(result.current.isPassword).toBe(false);

    input.value = "";
    const event = createChangeEvent(input);

    act(() => result.current.handleChange(event));

    expect(result.current.hasValue).toBe(false);
    expect(onChange).toHaveBeenCalledOnce();
    expect(onChange).toHaveBeenCalledWith(event);
  });

  it("derives value presence from controlled value and explicit override", () => {
    const onChange = vi.fn();
    const options = createOptions({ value: "controlled", onChange });
    const { result, rerender } = renderHook(props => useInput(props), {
      initialProps: options,
    });
    const input = document.createElement("input");

    input.value = "";
    act(() => result.current.handleChange(createChangeEvent(input)));

    expect(result.current.hasValue).toBe(true);
    expect(onChange).toHaveBeenCalledOnce();

    rerender({ ...options, value: "" });
    expect(result.current.hasValue).toBe(false);

    rerender({ ...options, value: 0 });
    expect(result.current.hasValue).toBe(true);

    rerender({ ...options, hasValue: false });
    expect(result.current.hasValue).toBe(false);
  });

  it("merges the forwarded ref and clears the native input", () => {
    const forwardedRef = React.createRef<HTMLInputElement>();
    const onClear = vi.fn();
    const options = createOptions({
      defaultValue: "value",
      forwardedRef,
      onClear,
    });
    const { result } = renderHook(props => useInput(props), {
      initialProps: options,
    });
    const input = document.createElement("input");
    const onInput = vi.fn();
    const focus = vi.spyOn(input, "focus");

    input.value = "value";
    input.addEventListener("input", onInput);

    act(() => result.current.inputRef(input));
    expect(forwardedRef.current).toBe(input);

    act(() => result.current.handleClear());

    expect(input.value).toBe("");
    expect(onInput).toHaveBeenCalledOnce();
    expect(onInput.mock.calls[0]?.[0]).toBeInstanceOf(Event);
    expect(focus).toHaveBeenCalledWith({ preventScroll: true });
    expect(result.current.hasValue).toBe(false);
    expect(onClear).toHaveBeenCalledOnce();

    act(() => result.current.inputRef(null));
    expect(forwardedRef.current).toBeNull();
  });

  it.each(["disabled", "readOnly"] as const)(
    "does not clear a %s input",
    restriction => {
      const onClear = vi.fn();
      const options = createOptions({
        defaultValue: "value",
        onClear,
        [restriction]: true,
      });
      const { result } = renderHook(props => useInput(props), {
        initialProps: options,
      });
      const input = document.createElement("input");

      input.value = "value";
      act(() => result.current.inputRef(input));
      act(() => result.current.handleClear());

      expect(input.value).toBe("value");
      expect(result.current.hasValue).toBe(true);
      expect(onClear).not.toHaveBeenCalled();
    },
  );

  it("toggles password visibility and resets it when the value disappears", () => {
    const options = createOptions({ defaultValue: "secret", type: "password" });
    const { result, rerender } = renderHook(props => useInput(props), {
      initialProps: options,
    });
    const input = document.createElement("input");

    expect(result.current.isPassword).toBe(true);
    expect(result.current.isPasswordVisible).toBe(false);
    expect(result.current.inputType).toBe("password");

    act(() => result.current.handlePasswordToggle());

    expect(result.current.isPasswordVisible).toBe(true);
    expect(result.current.inputType).toBe("text");

    input.value = "";
    act(() => result.current.handleChange(createChangeEvent(input)));

    expect(result.current.hasValue).toBe(false);
    expect(result.current.isPasswordVisible).toBe(false);
    expect(result.current.inputType).toBe("password");

    rerender({ ...options, disabled: true, hasValue: true });
    act(() => result.current.handlePasswordToggle());

    expect(result.current.isPasswordVisible).toBe(false);

    rerender({ ...options, type: "email" });
    expect(result.current.isPassword).toBe(false);
    expect(result.current.inputType).toBe("email");
  });

  it("reports whether the value is controlled", () => {
    const { result, rerender } = renderHook(props => useInput(props), {
      initialProps: createOptions(),
    });

    expect(result.current.isControlled).toBe(false);

    rerender(createOptions({ value: "" }));
    expect(result.current.isControlled).toBe(true);
  });
});
