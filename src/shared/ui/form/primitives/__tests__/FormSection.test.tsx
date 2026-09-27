import { render, renderHook, screen } from "@testing-library/react";
import * as React from "react";
import { useForm } from "react-hook-form";
import { vi } from "vitest";

import { Input } from "../../../input";
import { Form } from "../Form";
import { FormField } from "../FormField";
import { FormSection } from "../FormSection";

interface Values {
  code: string;
}

describe("FormSection", () => {
  it("forwards the form ref and links the section description", () => {
    const ref = React.createRef<HTMLFormElement>();
    const { result } = renderHook(() =>
      useForm<Values>({ defaultValues: { code: "" } }),
    );

    render(
      <Form ref={ref} form={result.current} onSubmit={vi.fn()}>
        <FormSection title="Доступ" description="Секретный код">
          <FormField<Values>
            name="code"
            label="Код"
            render={({ field, controlProps }) => (
              <Input {...controlProps} ref={field.ref} value={field.value} />
            )}
          />
        </FormSection>
      </Form>,
    );

    const section = screen.getByRole("group", { name: "Доступ" });

    expect(ref.current).toBeInstanceOf(HTMLFormElement);
    expect(section).toHaveAccessibleDescription("Секретный код");
  });

  it("joins an external aria-describedby with the description id", () => {
    render(
      <>
        <p id="external-hint">Внешняя подсказка</p>
        <FormSection
          title="Доступ"
          description="Секретный код"
          aria-describedby="external-hint"
        />
      </>,
    );

    const section = screen.getByRole("group", { name: "Доступ" });

    expect(section).toHaveAccessibleDescription(
      "Внешняя подсказка Секретный код",
    );
  });
});
