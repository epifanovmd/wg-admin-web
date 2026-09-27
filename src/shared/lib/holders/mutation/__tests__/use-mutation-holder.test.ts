import { renderHook } from "@testing-library/react";

import { useMutation } from "../use-mutation-holder";

describe("Mutation React integration", () => {
  it("runs mutation callbacks and throws from mutateAsync", async () => {
    const onSuccess = vi.fn();
    const onError = vi.fn();
    const onSettled = vi.fn();
    const hook = renderHook(() =>
      useMutation<number, string>({
        mutationFn: async value =>
          value > 0
            ? { data: String(value) }
            : { error: { message: "invalid" } },
        onSuccess,
        onError,
        onSettled,
      }),
    );

    await expect(hook.result.current.mutate(1)).resolves.toBe("1");
    Object.values(hook.result.current);
    expect(onSuccess).toHaveBeenCalledWith("1");
    await expect(hook.result.current.mutate(-1)).resolves.toBeUndefined();
    expect(onError).toHaveBeenCalledWith({ message: "invalid" });
    await expect(hook.result.current.mutateAsync(2)).resolves.toBe("2");
    await expect(hook.result.current.mutateAsync(-2)).rejects.toEqual({
      message: "invalid",
    });
    const empty = renderHook(() =>
      useMutation<void, string>({ mutationFn: async () => ({ data: null }) }),
    );

    await expect(empty.result.current.mutate()).resolves.toBeUndefined();
    empty.unmount();
    expect(hook.result.current.isBusy).toBe(false);
    hook.result.current.reset();
    expect(onSettled).toHaveBeenCalledTimes(4);
    hook.unmount();
  });

  it("updates mutation callbacks without replacing its holder", async () => {
    const first = vi.fn();
    const second = vi.fn();
    const mutationFn = async () => ({ data: "done" });
    const hook = renderHook(
      ({ onSuccess }: { onSuccess: (data: string) => void }) =>
        useMutation({ mutationFn, onSuccess }),
      { initialProps: { onSuccess: first } },
    );
    const holder = hook.result.current.holder;

    hook.rerender({ onSuccess: second });
    await hook.result.current.mutate();
    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledWith("done");
    expect(hook.result.current.holder).toBe(holder);
    hook.unmount();
  });
});
