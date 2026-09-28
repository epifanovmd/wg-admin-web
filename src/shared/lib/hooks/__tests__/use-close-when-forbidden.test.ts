import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { useCloseWhenForbidden } from "../use-close-when-forbidden";

describe("useCloseWhenForbidden", () => {
  it("закрывает открытое окно, когда действие стало недоступно", () => {
    const close = vi.fn();
    const { rerender } = renderHook(
      ({ open, allowed }) => useCloseWhenForbidden(open, allowed, close),
      { initialProps: { open: true, allowed: true } },
    );

    expect(close).not.toHaveBeenCalled();
    rerender({ open: true, allowed: false });
    expect(close).toHaveBeenCalledOnce();
  });

  it("закрытое окно не трогает", () => {
    const close = vi.fn();

    renderHook(() => useCloseWhenForbidden(false, false, close));

    expect(close).not.toHaveBeenCalled();
  });
});
