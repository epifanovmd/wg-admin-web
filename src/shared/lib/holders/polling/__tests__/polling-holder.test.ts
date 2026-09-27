import { deferred } from "../../__tests__/holder-test-utils";
import { PollingHolder } from "../polling-holder";

describe("PollingHolder", () => {
  it("loads immediately, refreshes on an interval and stops cleanly", async () => {
    vi.useFakeTimers();
    const fetch = vi.fn(async () => ({ data: 1 }));
    const holder = new PollingHolder<number>({ onFetch: fetch, interval: 10 });

    holder.startPolling();
    await Promise.resolve();
    expect(fetch).toHaveBeenCalledTimes(1);
    await vi.advanceTimersByTimeAsync(10);
    expect(fetch).toHaveBeenCalledTimes(2);
    holder.stopPolling();
    await vi.advanceTimersByTimeAsync(20);
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it("restarts, uses arguments and reset stops polling", async () => {
    vi.useFakeTimers();
    const fetch = vi.fn(async (value: string) => ({ data: value }));
    const holder = new PollingHolder<string, string>({
      onFetch: fetch,
      initialData: "initial",
    });

    holder.startPolling({ args: "one", interval: 5 });
    holder.startPolling({ args: "two", interval: 5 });
    await vi.advanceTimersByTimeAsync(5);
    expect(fetch).toHaveBeenCalledWith("two");
    holder.reset();
    expect(holder.isPolling).toBe(false);
  });

  it("does not schedule after polling is stopped during the initial load", async () => {
    vi.useFakeTimers();
    const pending = deferred<{ data: number }>();
    const holder = new PollingHolder<number>({
      onFetch: () => pending.promise,
      interval: 5,
    });

    holder.startPolling();
    holder.stopPolling();
    pending.resolve({ data: 1 });
    await Promise.resolve();
    await vi.advanceTimersByTimeAsync(10);
    expect(holder.isPolling).toBe(false);
  });

  it("ignores an already captured timer after polling stops", async () => {
    let callback: (() => Promise<void>) | undefined;
    const timeout = vi.spyOn(globalThis, "setTimeout").mockImplementation(((
      fn: () => Promise<void>,
    ) => {
      callback = fn;

      return 1;
    }) as typeof setTimeout);

    vi.spyOn(globalThis, "clearTimeout").mockImplementation(() => undefined);
    const holder = new PollingHolder<number>({ initialData: 1 });

    holder.startPolling();
    holder.stopPolling();
    await callback?.();
    expect(timeout).toHaveBeenCalled();
  });

  it("does not reschedule after polling stops during a refresh", async () => {
    let callback: (() => Promise<void>) | undefined;

    vi.spyOn(globalThis, "setTimeout").mockImplementation(((
      fn: () => Promise<void>,
    ) => {
      callback = fn;

      return 1;
    }) as typeof setTimeout);
    vi.spyOn(globalThis, "clearTimeout").mockImplementation(() => undefined);
    const pending = deferred<{ data: number }>();
    const holder = new PollingHolder<number>({
      initialData: 1,
      interval: 5,
      onFetch: () => pending.promise,
    });

    holder.startPolling();
    const running = callback!();

    await Promise.resolve();
    holder.stopPolling();
    pending.resolve({ data: 2 });
    await running;
    expect(holder.isPolling).toBe(false);
  });
});
