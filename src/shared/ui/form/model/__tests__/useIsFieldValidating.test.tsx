import { act, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { FormProvider, useForm } from "react-hook-form";

import { useIsFieldValidating } from "../use-is-field-validating";

interface Values {
  profile: { username: string };
}

const wait = (ms: number) =>
  new Promise<void>(resolve => {
    setTimeout(resolve, ms);
  });

describe("useIsFieldValidating", () => {
  it("reflects async validation of a nested field path", async () => {
    let release: () => void = () => {};
    const gate = new Promise<void>(resolve => {
      release = resolve;
    });
    const form = renderHook(() =>
      useForm<Values>({
        mode: "onChange",
        defaultValues: { profile: { username: "" } },
      }),
    );
    const wrapper = ({ children }: { children: ReactNode }) => (
      <FormProvider {...form.result.current}>{children}</FormProvider>
    );
    const { result } = renderHook(
      () =>
        useIsFieldValidating<Values, "profile.username">("profile.username"),
      { wrapper },
    );

    form.result.current.register("profile.username", {
      validate: async () => {
        await gate;

        return true;
      },
    });

    expect(result.current).toBe(false);

    act(() => {
      void form.result.current.trigger("profile.username");
    });
    await waitFor(() => expect(result.current).toBe(true));

    release();
    await act(() => wait(0));
    await waitFor(() => expect(result.current).toBe(false));
  });
});
