import {
  act,
  fireEvent,
  render,
  renderHook,
  screen,
} from "@testing-library/react";
import { z } from "zod";

import { useZodForm } from "../../model/use-zod-form";
import { Form } from "../../primitives/Form";
import {
  AutocompleteFormField,
  DateRangePickerFormField,
  MaskedDatePickerFormField,
  MaskedDateRangePickerFormField,
  MultiSelectFormField,
} from "..";

const schema = z.object({
  city: z.string(),
  tags: z.array(z.string()),
  period: z
    .object({ from: z.date().optional(), to: z.date().optional() })
    .optional(),
  birthday: z.date().optional(),
  vacation: z
    .object({ from: z.date().optional(), to: z.date().optional() })
    .optional(),
});

type Values = z.input<typeof schema>;

const DEFAULTS: Values = {
  city: "",
  tags: [],
  period: undefined,
  birthday: undefined,
  vacation: undefined,
};

const createForm = () =>
  renderHook(() => useZodForm(schema, { defaultValues: DEFAULTS }));

const CITIES = [
  { value: "Москва", label: "Москва" },
  { value: "Минск", label: "Минск" },
];

const TAGS = [
  { value: "react", label: "React" },
  { value: "vite", label: "Vite" },
];

describe("адаптеры форм: autocomplete, multi-select и пикеры", () => {
  it("Autocomplete пишет текст в форму и сбрасывается вместе с ней", () => {
    const form = createForm();

    render(
      <Form form={form.result.current} onSubmit={vi.fn()}>
        <AutocompleteFormField<Values>
          name="city"
          label="Город"
          options={CITIES}
        />
      </Form>,
    );

    const input = screen.getByRole("combobox", { name: "Город" });

    fireEvent.input(input, { target: { value: "Мин" } });
    expect(form.result.current.getValues("city")).toBe("Мин");

    act(() => form.result.current.reset(DEFAULTS));
    expect(input).toHaveValue("");
  });

  it("MultiSelect добавляет выбранные значения в массив", () => {
    const form = createForm();

    render(
      <Form form={form.result.current} onSubmit={vi.fn()}>
        <MultiSelectFormField<Values> name="tags" label="Теги" options={TAGS} />
      </Form>,
    );

    fireEvent.click(screen.getByRole("combobox", { name: "Теги" }));
    fireEvent.click(screen.getByRole("option", { name: "React" }));
    fireEvent.click(screen.getByRole("option", { name: "Vite" }));

    expect(form.result.current.getValues("tags")).toEqual(["react", "vite"]);
  });

  it("DateRangePicker кладёт в форму диапазон из двух кликов", () => {
    const form = createForm();

    render(
      <Form form={form.result.current} onSubmit={vi.fn()}>
        <DateRangePickerFormField<Values>
          name="period"
          label="Период"
          calendarProps={{ defaultMonth: 2, defaultYear: 2024 }}
        />
      </Form>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Период" }));
    fireEvent.click(screen.getByRole("button", { name: "4 марта 2024" }));
    fireEvent.click(screen.getByRole("button", { name: "8 марта 2024" }));

    expect(form.result.current.getValues("period")).toEqual({
      from: new Date(2024, 2, 4),
      to: new Date(2024, 2, 8),
    });
  });

  it("MaskedDatePicker отдаёт в форму только полную дату", () => {
    const form = createForm();

    render(
      <Form form={form.result.current} onSubmit={vi.fn()}>
        <MaskedDatePickerFormField<Values>
          name="birthday"
          label="День рождения"
        />
      </Form>,
    );

    const input = screen.getByRole("textbox", { name: "День рождения" });

    fireEvent.input(input, { target: { value: "12.03" } });
    expect(form.result.current.getValues("birthday")).toBeUndefined();

    fireEvent.input(input, { target: { value: "12.03.2024" } });
    expect(form.result.current.getValues("birthday")).toEqual(
      new Date(2024, 2, 12),
    );
  });

  it("MaskedDateRangePicker отдаёт в форму полный период", () => {
    const form = createForm();

    render(
      <Form form={form.result.current} onSubmit={vi.fn()}>
        <MaskedDateRangePickerFormField<Values>
          name="vacation"
          label="Отпуск"
        />
      </Form>,
    );

    fireEvent.input(screen.getByRole("textbox", { name: "Отпуск" }), {
      target: { value: "01.07.2024 — 14.07.2024" },
    });

    expect(form.result.current.getValues("vacation")).toEqual({
      from: new Date(2024, 6, 1),
      to: new Date(2024, 6, 14),
    });
  });
});
