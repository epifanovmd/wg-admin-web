import { describe, expect, it, vi } from "vitest";

import { handleSkippedViewTransitions } from "../view-transitions";

interface FakeTransition {
  ready: Promise<void>;
  finished: Promise<void>;
  updateCallbackDone: Promise<void>;
}

/** Браузерный `startViewTransition`: пропущенный переход отклоняет `ready`. */
const installBrowserApi = (ready: Promise<void>) => {
  const update = vi.fn();
  const start = vi.fn((callback: () => void): FakeTransition => {
    callback();

    return {
      ready,
      finished: Promise.resolve(),
      updateCallbackDone: Promise.resolve(),
    };
  });

  Object.defineProperty(document, "startViewTransition", {
    configurable: true,
    writable: true,
    value: start,
  });

  return { update, start };
};

describe("handleSkippedViewTransitions", () => {
  it("пропущенный переход не даёт необработанного отклонения, обновление выполняется", async () => {
    const skipped = Promise.reject(new DOMException("skipped", "AbortError"));
    const { update, start } = installBrowserApi(skipped);
    const unhandled = vi.fn();

    window.addEventListener("unhandledrejection", unhandled);
    handleSkippedViewTransitions();
    document.startViewTransition(update);
    await new Promise(resolve => setTimeout(resolve, 0));
    window.removeEventListener("unhandledrejection", unhandled);

    expect(start).toHaveBeenCalledTimes(1);
    expect(update).toHaveBeenCalledTimes(1);
    expect(unhandled).not.toHaveBeenCalled();
  });

  it("без поддержки View Transitions ничего не делает", () => {
    Reflect.deleteProperty(document, "startViewTransition");

    expect(() => handleSkippedViewTransitions()).not.toThrow();
    expect("startViewTransition" in document).toBe(false);
  });
});
