import {
  fireEvent,
  render,
  renderHook,
  screen,
  waitFor,
} from "@testing-library/react";
import { vi } from "vitest";
import { z } from "zod";

import { phoneMask } from "../../../masked-input";
import { Radio } from "../../../radio";
import { useZodForm } from "../../model/use-zod-form";
import { Form } from "../../primitives/Form";
import { FormSubmit } from "../../primitives/FormSubmit";
import {
  CheckboxFormField,
  DatePickerFormField,
  InputFormField,
  MaskedInputFormField,
  RadioFormField,
  SegmentedFormField,
  SelectFormField,
  SwitchFormField,
  TextareaFormField,
} from "..";

const schema = z.object({
  name: z.string(),
  accepted: z.boolean(),
  country: z.string().nullable(),
  date: z.date().optional(),
  bio: z.string().max(5, "Слишком длинно"),
  plan: z.enum(["free", "pro"]),
  view: z.enum(["compact", "comfortable"]),
  active: z.boolean().refine(Boolean, "Включите профиль"),
  phone: z.string().min(11, "Введите телефон полностью"),
});

type Values = z.input<typeof schema>;

const createForm = () =>
  renderHook(() =>
    useZodForm(schema, {
      defaultValues: {
        name: "",
        accepted: false,
        country: null,
        date: undefined,
        bio: "",
        plan: "free",
        view: "compact",
        active: false,
        phone: "",
      },
    }),
  );

describe("form field adapters", () => {
  it("composes Input callbacks with RHF updates", () => {
    const form = createForm();
    const onChange = vi.fn();
    const onClear = vi.fn();

    render(
      <Form form={form.result.current} onSubmit={vi.fn()}>
        <InputFormField<Values>
          name="name"
          label="Name"
          clearable
          onChange={onChange}
          onClear={onClear}
        />
      </Form>,
    );

    const input = screen.getByRole("textbox", { name: "Name" });

    fireEvent.change(input, { target: { value: "Alice" } });

    expect(form.result.current.getValues("name")).toBe("Alice");
    expect(onChange).toHaveBeenCalledOnce();
    expect(input).not.toHaveAttribute("required");

    fireEvent.click(screen.getByRole("button", { name: "Очистить" }));
    expect(form.result.current.getValues("name")).toBe("");
    expect(onClear).toHaveBeenCalledOnce();
  });

  it("renders the Checkbox label inside the control and keeps the required mark", () => {
    const form = createForm();

    render(
      <Form form={form.result.current} onSubmit={vi.fn()}>
        <CheckboxFormField<Values>
          name="accepted"
          label="Accepted"
          description="Условия сервиса"
          required
        />
      </Form>,
    );

    const checkbox = screen.getByRole("checkbox", { name: /Accepted/ });

    expect(checkbox).toHaveAttribute("aria-required", "true");
    expect(checkbox).toHaveAccessibleDescription("Условия сервиса");
    expect(screen.queryByText("Accepted")?.closest("label")).toHaveAttribute(
      "for",
      checkbox.id,
    );

    fireEvent.click(checkbox);
    expect(form.result.current.getValues("accepted")).toBe(true);
  });

  it("updates a single Select and marks it touched after closing", () => {
    const form = createForm();

    render(
      <Form form={form.result.current} onSubmit={vi.fn()}>
        <SelectFormField<Values>
          name="country"
          label="Country"
          options={[{ value: "RU", label: "Russia" }]}
        />
      </Form>,
    );

    fireEvent.click(screen.getByRole("combobox", { name: "Country" }));
    fireEvent.click(screen.getByText("Russia"));

    expect(form.result.current.getValues("country")).toBe("RU");
    expect(form.result.current.getFieldState("country").isTouched).toBe(true);
  });

  it("forwards DatePicker blur and ref-compatible accessibility props", () => {
    const form = createForm();

    render(
      <Form form={form.result.current} onSubmit={vi.fn()}>
        <DatePickerFormField<Values> name="date" label="Date" />
      </Form>,
    );

    const trigger = screen.getByRole("button", { name: "Date" });

    fireEvent.blur(trigger);

    expect(form.result.current.getFieldState("date").isTouched).toBe(true);
    expect(trigger).toHaveAttribute("aria-labelledby");
  });

  it("wires Textarea value and shows the validation error", async () => {
    const form = createForm();

    render(
      <Form form={form.result.current} onSubmit={vi.fn()}>
        <TextareaFormField<Values> name="bio" label="Bio" showCount />
        <FormSubmit>Save</FormSubmit>
      </Form>,
    );

    const textarea = screen.getByRole("textbox", { name: "Bio" });

    fireEvent.change(textarea, { target: { value: "too long" } });
    expect(form.result.current.getValues("bio")).toBe("too long");
    expect(screen.getByText("8")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Слишком длинно",
    );
    expect(textarea).toHaveAttribute("aria-invalid", "true");
    expect(textarea).toHaveAccessibleDescription(/Слишком длинно/);
  });

  it("wires RadioGroup selection and forwards the RHF ref", () => {
    const form = createForm();

    render(
      <Form form={form.result.current} onSubmit={vi.fn()}>
        <RadioFormField<Values> name="plan" label="Plan">
          <Radio value="free" label="Free" />
          <Radio value="pro" label="Pro" />
        </RadioFormField>
      </Form>,
    );

    const group = screen.getByRole("radiogroup", { name: "Plan" });

    expect(screen.getByRole("radio", { name: "Free" })).toBeChecked();

    fireEvent.click(screen.getByRole("radio", { name: "Pro" }));
    expect(form.result.current.getValues("plan")).toBe("pro");
    expect(group).toHaveAttribute("id");
  });

  it("wires Segmented selection", () => {
    const form = createForm();
    const onValueChange = vi.fn();

    render(
      <Form form={form.result.current} onSubmit={vi.fn()}>
        <SegmentedFormField<Values>
          name="view"
          label="View"
          onValueChange={onValueChange}
          options={[
            { value: "compact", label: "Compact" },
            { value: "comfortable", label: "Comfortable" },
          ]}
        />
      </Form>,
    );

    fireEvent.click(screen.getByRole("radio", { name: "Comfortable" }));

    expect(form.result.current.getValues("view")).toBe("comfortable");
    expect(onValueChange).toHaveBeenCalledWith("comfortable");
  });

  it("wires Switch value with its own label and shows the error", async () => {
    const form = createForm();

    render(
      <Form form={form.result.current} onSubmit={vi.fn()}>
        <SwitchFormField<Values> name="active" label="Active" />
        <FormSubmit>Save</FormSubmit>
      </Form>,
    );

    const toggle = screen.getByRole("switch", { name: "Active" });

    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Включите профиль",
    );
    expect(toggle).toHaveAttribute("aria-invalid", "true");

    fireEvent.click(toggle);
    expect(form.result.current.getValues("active")).toBe(true);
    await waitFor(() => expect(screen.queryByRole("alert")).toBeNull());
  });

  it("stores the unmasked MaskedInput value and shows the error", async () => {
    const form = createForm();

    render(
      <Form form={form.result.current} onSubmit={vi.fn()}>
        <MaskedInputFormField<Values>
          name="phone"
          label="Phone"
          mask={phoneMask}
        />
        <FormSubmit>Save</FormSubmit>
      </Form>,
    );

    const input = screen.getByRole("textbox", { name: "Phone" });

    fireEvent.input(input, { target: { value: "+7 (916) 123" } });
    expect(form.result.current.getValues("phone")).toBe("7916123");

    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Введите телефон полностью",
    );
    expect(input).toHaveAttribute("aria-invalid", "true");
  });
});
