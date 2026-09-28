import { act, renderHook } from "@testing-library/react";

import { useWatchEffect } from "../../hooks/watch-effect";
import { usePolling } from "../use-polling-holder";

describe("Polling React integration", () => {
  it("auto-starts and cleans up polling", async () => {
    vi.useFakeTimers();
    const query = vi.fn(async () => ({ data: 1 }));
    const hook = renderHook(() =>
      usePolling<number, void>({
        queryFn: query,
        interval: 5,
        autoStart: true,
      }),
    );

    await act(async () => undefined);
    expect(hook.result.current.isPolling).toBe(true);
    Object.values(hook.result.current);
    hook.result.current.stop();
    hook.result.current.start({ interval: 5 });
    await vi.advanceTimersByTimeAsync(5);
    await hook.result.current.load();
    await hook.result.current.refresh();
    hook.result.current.reset();
    hook.unmount();
  });

  it("passes auto-start arguments to polling", async () => {
    const query = vi.fn(async (value: string) => ({ data: value }));
    const hook = renderHook(() =>
      usePolling({ queryFn: query, autoStart: "argument" }),
    );

    await act(async () => undefined);
    expect(query).toHaveBeenCalledWith("argument");
    hook.unmount();
  });

  it("supports hook defaults without options", async () => {
    const polling = renderHook(() => usePolling<number>());

    polling.unmount();
    const watch = renderHook(() => useWatchEffect(() => undefined));

    watch.unmount();
  });

  it("calls the queryFn of the latest render", async () => {
    const hook = renderHook(
      ({ value }: { value: string }) =>
        usePolling<string>({ queryFn: async () => ({ data: value }) }),
      { initialProps: { value: "first" } },
    );

    hook.rerender({ value: "second" });
    await act(async () => {
      await hook.result.current.load();
    });
    expect(hook.result.current.data).toBe("second");
    hook.unmount();
  });
});
