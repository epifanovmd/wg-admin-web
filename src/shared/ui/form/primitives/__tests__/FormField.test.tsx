import {
  fireEvent,
  render,
  renderHook,
  screen,
  waitFor,
} from "@testing-library/react";
import { useForm } from "react-hook-form";
import { vi } from "vitest";

import { Input } from "../../../input";
import { Form } from "../Form";
import { FormField } from "../FormField";
import { FormSubmit } from "../FormSubmit";

interface Values {
  code: string;
}

describe("FormField", () => {
  it("disables the control but keeps the value in submit data", async () => {
    const onSubmit = vi.fn();
    const { result } = renderHook(() =>
      useForm<Values>({ defaultValues: { code: "ABC" } }),
    );

    render(
      <Form form={result.current} onSubmit={onSubmit}>
        <FormField<Values>
          name="code"
          label="Код"
          disabled
          render={({ field, controlProps }) => (
            <Input {...controlProps} ref={field.ref} value={field.value} />
          )}
        />
        <FormSubmit>Отправить</FormSubmit>
      </Form>,
    );

    expect(screen.getByRole("textbox", { name: "Код" })).toBeDisabled();

    fireEvent.click(screen.getByRole("button", { name: "Отправить" }));

    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith({ code: "ABC" }, expect.anything()),
    );
  });
});
