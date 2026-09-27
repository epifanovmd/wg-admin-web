import { act, renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { FormProvider, useForm } from "react-hook-form";

import { useFormValue } from "../use-form-value";

interface Values {
  type: "person" | "company";
  other: string;
}

describe("useFormValue", () => {
  it("subscribes to a single field value", () => {
    const form = renderHook(() =>
      useForm<Values>({ defaultValues: { type: "person", other: "" } }),
    );
    const wrapper = ({ children }: { children: ReactNode }) => (
      <FormProvider {...form.result.current}>{children}</FormProvider>
    );
    const renders: string[] = [];
    const { result } = renderHook(
      () => {
        const value = useFormValue<Values, "type">("type");

        renders.push(value);

        return value;
      },
      { wrapper },
    );

    expect(result.current).toBe("person");

    act(() => form.result.current.setValue("other", "noise"));
    expect(renders).toHaveLength(1);

    act(() => form.result.current.setValue("type", "company"));
    expect(result.current).toBe("company");
  });
});
