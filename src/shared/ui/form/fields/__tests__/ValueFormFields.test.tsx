import {
  fireEvent,
  render,
  renderHook,
  screen,
  waitFor,
} from "@testing-library/react";
import { vi } from "vitest";
import { z } from "zod";

import { useZodForm } from "../../model/use-zod-form";
import { Form } from "../../primitives/Form";
import { FormSubmit } from "../../primitives/FormSubmit";
import {
  NumberInputFormField,
  OtpInputFormField,
  SliderFormField,
  TimePickerFormField,
} from "..";

const schema = z.object({
  code: z.string().length(4, "Введите код полностью"),
  price: z.number({ message: "Укажите цену" }).nullable(),
  volume: z.number(),
  budget: z.array(z.number()),
  startsAt: z.date().optional(),
});

type Values = z.input<typeof schema>;

const DEFAULTS: Values = {
  code: "",
  price: null,
  volume: 20,
  budget: [100, 500],
  startsAt: new Date(2024, 2, 12, 9, 0),
};

const createForm = () =>
  renderHook(() => useZodForm(schema, { defaultValues: DEFAULTS }));

describe("адаптеры форм: OTP, число, слайдер, время", () => {
  it("OtpInput пишет код в форму, вызывает свой onValueChange и показывает ошибку", async () => {
    const form = createForm();
    const onValueChange = vi.fn();

    render(
      <Form form={form.result.current} onSubmit={vi.fn()}>
        <OtpInputFormField<Values>
          name="code"
          label="Код"
          length={4}
          onValueChange={onValueChange}
        />
        <FormSubmit>Отправить</FormSubmit>
      </Form>,
    );

    const cells = screen.getAllByRole("textbox");

    expect(screen.getByRole("group", { name: "Код" })).toBeInTheDocument();

    fireEvent.change(cells[0]!, { target: { value: "12" } });
    expect(form.result.current.getValues("code")).toBe("12");
    expect(onValueChange).toHaveBeenCalledWith("12");

    fireEvent.click(screen.getByRole("button", { name: "Отправить" }));
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Введите код полностью",
    );
    expect(cells[0]).toHaveAttribute("aria-invalid", "true");
    expect(cells[0]).toHaveAccessibleDescription(/Введите код полностью/);
  });

  it("NumberInput пишет число, а пустое поле — null", () => {
    const form = createForm();

    render(
      <Form form={form.result.current} onSubmit={vi.fn()}>
        <NumberInputFormField<Values> name="price" label="Цена" suffix="₽" />
      </Form>,
    );

    const field = screen.getByRole("spinbutton", { name: "Цена" });

    fireEvent.focus(field);
    fireEvent.change(field, { target: { value: "1500,5" } });
    expect(form.result.current.getValues("price")).toBe(1500.5);

    fireEvent.change(field, { target: { value: "" } });
    fireEvent.blur(field);
    expect(form.result.current.getValues("price")).toBeNull();
    expect(form.result.current.getFieldState("price").isTouched).toBe(true);
  });

  it("Slider пишет число для одиночного и массив для диапазона", () => {
    const form = createForm();

    render(
      <Form form={form.result.current} onSubmit={vi.fn()}>
        <SliderFormField<Values> name="volume" label="Громкость" />
        <SliderFormField<Values>
          name="budget"
          label="Бюджет"
          max={1000}
          step={50}
        />
      </Form>,
    );

    const volume = screen.getByRole("slider", { name: "Громкость" });

    fireEvent.keyDown(volume, { key: "ArrowRight" });
    expect(form.result.current.getValues("volume")).toBe(21);

    const max = screen.getByRole("slider", { name: "Максимум" });

    fireEvent.focus(max);
    fireEvent.keyDown(max, { key: "ArrowRight" });
    expect(form.result.current.getValues("budget")).toEqual([100, 550]);
  });

  it("TimePicker меняет время, сохраняя день значения формы", async () => {
    const form = createForm();

    render(
      <Form form={form.result.current} onSubmit={vi.fn()}>
        <TimePickerFormField<Values> name="startsAt" label="Начало" />
      </Form>,
    );

    const input = screen.getByRole("textbox", { name: "Начало" });

    fireEvent.input(input, { target: { value: "18:15" } });

    await waitFor(() =>
      expect(form.result.current.getValues("startsAt")).toEqual(
        new Date(2024, 2, 12, 18, 15),
      ),
    );
  });
});
