import {
  fireEvent,
  render,
  renderHook,
  screen,
  waitFor,
} from "@testing-library/react";
import { type Resolver, type ResolverResult, useForm } from "react-hook-form";
import { vi } from "vitest";

import { InputFormField } from "../../fields";
import { Form } from "../Form";
import { FormSubmit } from "../FormSubmit";

interface Values {
  name: string;
}

const resolve: Resolver<Values> = async (
  values,
): Promise<ResolverResult<Values>> => {
  if (values.name === "") {
    return {
      values: {},
      errors: { name: { type: "required", message: "Обязательно" } },
    };
  }

  return { values, errors: {} };
};

const createResolver = () => vi.fn(resolve);

describe("FormSubmit", () => {
  it("does not subscribe to isValid (and does not run the resolver on change) by default", async () => {
    const resolver = createResolver();
    const { result } = renderHook(() =>
      useForm<Values>({ resolver, defaultValues: { name: "" } }),
    );

    render(
      <Form form={result.current} onSubmit={vi.fn()}>
        <InputFormField<Values> name="name" label="Имя" />
        <FormSubmit>Сохранить</FormSubmit>
      </Form>,
    );

    fireEvent.change(screen.getByRole("textbox", { name: "Имя" }), {
      target: { value: "Alice" },
    });

    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Сохранить" })).toBeEnabled(),
    );
    expect(resolver).not.toHaveBeenCalled();
  });

  it("disables the button while the form is invalid when disableWhenInvalid is set", async () => {
    const resolver = createResolver();
    const { result } = renderHook(() =>
      useForm<Values>({ resolver, defaultValues: { name: "" } }),
    );

    render(
      <Form form={result.current} onSubmit={vi.fn()}>
        <InputFormField<Values> name="name" label="Имя" />
        <FormSubmit disableWhenInvalid>Сохранить</FormSubmit>
      </Form>,
    );

    const button = screen.getByRole("button", { name: "Сохранить" });

    await waitFor(() => expect(button).toBeDisabled());
    expect(resolver).toHaveBeenCalled();

    fireEvent.change(screen.getByRole("textbox", { name: "Имя" }), {
      target: { value: "Alice" },
    });

    await waitFor(() => expect(button).toBeEnabled());
  });
});
