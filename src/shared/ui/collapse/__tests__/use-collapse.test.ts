import { act, renderHook } from "@testing-library/react";
import { vi } from "vitest";

import { useCollapse } from "../hooks/use-collapse";

describe("useCollapse", () => {
  it("toggles, opens and closes in uncontrolled mode", () => {
    const { result } = renderHook(() => useCollapse());

    expect(result.current.isOpen).toBe(false);

    act(() => result.current.toggle());
    expect(result.current.isOpen).toBe(true);

    act(() => result.current.close());
    expect(result.current.isOpen).toBe(false);

    act(() => result.current.open());
    expect(result.current.isOpen).toBe(true);
  });

  it("only reports changes in controlled mode", () => {
    const onOpenChange = vi.fn();
    const { result } = renderHook(() =>
      useCollapse({ open: false, onOpenChange }),
    );

    act(() => result.current.toggle());

    expect(onOpenChange).toHaveBeenCalledWith(true);
    expect(result.current.isOpen).toBe(false);
  });

  it("ignores every change while disabled", () => {
    const onOpenChange = vi.fn();
    const { result } = renderHook(() =>
      useCollapse({ defaultOpen: true, disabled: true, onOpenChange }),
    );

    act(() => {
      result.current.toggle();
      result.current.setOpen(false);
      result.current.close();
    });

    expect(result.current.isOpen).toBe(true);
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it("returns a referentially stable result between identical renders", () => {
    const { result, rerender } = renderHook(() => useCollapse());
    const first = result.current;

    rerender();
    expect(result.current).toBe(first);

    act(() => result.current.toggle());
    expect(result.current).not.toBe(first);
  });
});
