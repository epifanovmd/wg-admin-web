import {
  fireEvent,
  render,
  renderHook,
  screen,
  waitFor,
} from "@testing-library/react";
import { vi } from "vitest";
import { z } from "zod";

import { InputFormField } from "../../fields";
import { useZodForm } from "../../model/use-zod-form";
import { Form } from "../Form";
import { FormSubmit } from "../FormSubmit";

const schema = z.object({ email: z.string().email("Invalid email") });

type Values = z.input<typeof schema>;

describe("Form", () => {
  it("submits parsed values through the native form contract", async () => {
    const onSubmit = vi.fn();
    const { result } = renderHook(() =>
      useZodForm(schema, { defaultValues: { email: "" } }),
    );

    render(
      <Form form={result.current} onSubmit={onSubmit}>
        <InputFormField<Values> name="email" label="Email" />
        <FormSubmit>Save</FormSubmit>
      </Form>,
    );

    fireEvent.change(screen.getByRole("textbox", { name: "Email" }), {
      target: { value: "user@example.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith(
        { email: "user@example.com" },
        expect.anything(),
      ),
    );
  });

  it("connects label, description, required state and validation error", async () => {
    const { result } = renderHook(() =>
      useZodForm(schema, { defaultValues: { email: "" } }),
    );

    render(
      <Form form={result.current} onSubmit={vi.fn()}>
        <InputFormField<Values>
          name="email"
          label="Email"
          description="Work address"
          required
        />
        <FormSubmit>Save</FormSubmit>
      </Form>,
    );

    const input = screen.getByRole("textbox", { name: "Email" });

    expect(input).toHaveAttribute("aria-required", "true");
    expect(input).toHaveAccessibleDescription("Work address");

    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Invalid email");
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAccessibleDescription("Work address Invalid email");
    expect(input).toHaveFocus();
  });
});
