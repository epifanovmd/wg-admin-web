import { TooltipProvider } from "@radix-ui/react-tooltip";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { WgToggleSwitch } from "../WgToggleSwitch";

const renderSwitch = (enabled: boolean, onToggle: () => Promise<boolean>) =>
  render(
    <TooltipProvider>
      <WgToggleSwitch enabled={enabled} onToggle={onToggle} />
    </TooltipProvider>,
  );

const state = () => screen.getByRole("switch").getAttribute("data-state");

describe("WgToggleSwitch", () => {
  it("состояние тумблера не перетирается подсказкой", () => {
    // data-state на Switch задаёт стили checked/unchecked; Tooltip-обёртка
    // не должна подменять его своим «closed».
    renderSwitch(true, vi.fn());
    expect(state()).toBe("checked");
  });

  it("переключается сразу, не дожидаясь ответа сервера", async () => {
    let resolve: (ok: boolean) => void = () => undefined;
    const onToggle = vi.fn(
      () => new Promise<boolean>(done => (resolve = done)),
    );

    renderSwitch(true, onToggle);
    fireEvent.click(screen.getByRole("switch"));

    expect(state()).toBe("unchecked");
    await act(async () => resolve(true));
    expect(state()).toBe("unchecked");
  });

  it("ошибка сервера — тумблер возвращается", async () => {
    renderSwitch(true, vi.fn().mockResolvedValue(false));

    await act(async () => {
      fireEvent.click(screen.getByRole("switch"));
    });

    expect(state()).toBe("checked");
  });
});
