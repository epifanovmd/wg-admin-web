import { act, renderHook } from "@testing-library/react";
import { vi } from "vitest";

import { useModalController } from "../hooks/use-modal-controller";

describe("useModalController", () => {
  it("opens, toggles and closes modals by key", () => {
    const { result } = renderHook(() =>
      useModalController({ list: {}, create: { defaultOpen: true } }),
    );

    expect(result.current.isOpen("list")).toBe(false);
    expect(result.current.isOpen("create")).toBe(true);

    act(() => result.current.open("list"));
    expect(result.current.modals.list.open).toBe(true);

    act(() => result.current.toggle("list"));
    expect(result.current.modals.list.open).toBe(false);

    act(() => result.current.modals.list.onToggle());
    expect(result.current.modals.list.open).toBe(true);

    act(() => result.current.closeAll());
    expect(result.current.isOpen("list")).toBe(false);
    expect(result.current.isOpen("create")).toBe(false);
  });

  it("hides a suspended modal while the suspending one is open", () => {
    const { result } = renderHook(() =>
      useModalController({ list: {}, create: { suspends: ["list"] } }),
    );

    act(() => {
      result.current.open("list");
      result.current.open("create");
    });

    expect(result.current.isOpen("list")).toBe(false);
    expect(result.current.isOpen("create")).toBe(true);

    act(() => result.current.close("create"));
    expect(result.current.isOpen("list")).toBe(true);
  });

  it("delegates controlled modals to onOpenChange", () => {
    const onOpenChange = vi.fn();
    const { result, rerender } = renderHook(
      ({ open }: { open: boolean }) =>
        useModalController({ list: { open, onOpenChange } }),
      { initialProps: { open: false } },
    );

    act(() => result.current.open("list"));
    expect(onOpenChange).toHaveBeenCalledWith(true);
    expect(result.current.isOpen("list")).toBe(false);

    rerender({ open: true });
    expect(result.current.isOpen("list")).toBe(true);

    act(() => result.current.toggle("list"));
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
  });

  it("keeps the modals map stable across re-renders with an inline config", () => {
    const { result, rerender } = renderHook(() =>
      useModalController({ list: {}, create: {} }),
    );

    const first = result.current.modals;

    rerender();

    expect(result.current.modals).toBe(first);
  });

  it("в управляемом режиме отражает внешнее open без задержки", () => {
    const onOpenChange = vi.fn();
    const { result, rerender } = renderHook(
      ({ open }) =>
        useModalController({ list: { open, onOpenChange }, other: {} }),
      { initialProps: { open: false } },
    );

    expect(result.current.modals.list.open).toBe(false);

    rerender({ open: true });
    expect(result.current.modals.list.open).toBe(true);
    expect(result.current.isOpen("list")).toBe(true);

    act(() => result.current.modals.list.onClose());
    expect(onOpenChange).toHaveBeenCalledWith(false);

    rerender({ open: false });
    expect(result.current.modals.list.open).toBe(false);
  });

  it("toggle в управляемом режиме опирается на актуальное внешнее значение", () => {
    const onOpenChange = vi.fn();
    const { result, rerender } = renderHook(
      ({ open }) => useModalController({ list: { open, onOpenChange } }),
      { initialProps: { open: false } },
    );

    rerender({ open: true });
    act(() => result.current.toggle("list"));

    expect(onOpenChange).toHaveBeenLastCalledWith(false);
  });
});
