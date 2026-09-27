import { act, fireEvent, render, screen, within } from "@testing-library/react";
import * as React from "react";

import { Select } from "../Select";
import { useAsyncOptions } from "../strategies/use-async-options";
import type { SelectOption, SelectProps } from "../types";

const OPTIONS: SelectOption<string>[] = [
  { value: "ru", label: "Россия" },
  { value: "kz", label: "Казахстан", disabled: true },
  { value: "by", label: "Беларусь" },
];

const renderSelect = (props: Partial<SelectProps<string>> = {}) => {
  const onChange = vi.fn();

  render(
    <Select
      aria-label="Страна"
      onChange={onChange}
      {...({ options: OPTIONS, ...props } as SelectProps<string>)}
    />,
  );

  return {
    onChange,
    trigger: screen.getByRole("combobox", { name: "Страна" }),
  };
};

describe("Select", () => {
  it("открывается с клавиатуры и связывает активную опцию через aria-activedescendant", () => {
    const { trigger } = renderSelect();

    fireEvent.keyDown(trigger, { key: "ArrowDown" });

    const listbox = screen.getByRole("listbox");

    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(trigger).toHaveAttribute("aria-controls", listbox.id);
    expect(trigger.getAttribute("aria-activedescendant")).toBe(
      within(listbox).getAllByRole("option")[0].id,
    );
  });

  it("стрелки пропускают disabled-опцию, Enter выбирает", () => {
    const { trigger, onChange } = renderSelect();

    fireEvent.keyDown(trigger, { key: "ArrowDown" });
    fireEvent.keyDown(trigger, { key: "ArrowDown" });
    fireEvent.keyDown(trigger, { key: "Enter" });

    expect(onChange).toHaveBeenCalledWith("by");
  });

  it("не вызывает onDeselect при повторном выборе в single-режиме", () => {
    const onDeselect = vi.fn();
    const onSelect = vi.fn();

    renderSelect({ value: "ru", onSelect, onDeselect });
    fireEvent.click(screen.getByRole("combobox", { name: "Страна" }));
    fireEvent.click(screen.getByRole("option", { name: "Россия" }));

    expect(onDeselect).not.toHaveBeenCalled();
    expect(onSelect).toHaveBeenCalledWith("ru", OPTIONS[0]);
  });

  it("очищает значение и прячет очистку у disabled", () => {
    const { onChange } = renderSelect({ value: "ru", clearable: true });

    fireEvent.click(screen.getByRole("button", { name: "Очистить" }));
    expect(onChange).toHaveBeenCalledWith(null);
  });

  it("не показывает очистку у disabled", () => {
    renderSelect({ value: "ru", clearable: true, disabled: true });

    expect(screen.queryByRole("button", { name: "Очистить" })).toBeNull();
  });

  it("удаляет тег в multi-режиме", () => {
    const onChange = vi.fn();

    render(
      <Select<string>
        aria-label="Страны"
        multi
        options={OPTIONS}
        value={["ru", "by"]}
        onChange={onChange}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Удалить Россия" }));
    expect(onChange).toHaveBeenCalledWith(["by"]);
  });

  it("не вкладывает кнопки удаления тегов в кнопку-триггер", () => {
    render(
      <Select<string>
        aria-label="Страны"
        multi
        options={OPTIONS}
        value={["ru", "by"]}
      />,
    );

    const trigger = screen.getByRole("combobox", { name: "Страны" });

    expect(trigger.querySelector("button")).toBeNull();
    expect(
      screen.getByRole("button", { name: "Удалить Россия" }),
    ).toBeInTheDocument();
  });

  it("возвращает label вместе со значением при labelInValue", () => {
    const onChange = vi.fn();

    render(
      <Select<string>
        aria-label="Страна"
        labelInValue
        options={OPTIONS}
        onChange={onChange}
      />,
    );

    fireEvent.click(screen.getByRole("combobox", { name: "Страна" }));
    fireEvent.click(screen.getByRole("option", { name: "Беларусь" }));

    expect(onChange).toHaveBeenCalledWith({ value: "by", label: "Беларусь" });
  });

  it("рендерит скрытые input'ы для нативной формы", () => {
    const { container } = render(
      <Select<string>
        aria-label="Страна"
        name="country"
        options={OPTIONS}
        value="ru"
      />,
    );

    expect(
      container.querySelector('input[type="hidden"][name="country"]'),
    ).toHaveValue("ru");
  });

  it("показывает спиннер при async-загрузке даже с hideEmpty", async () => {
    let resolve: (items: string[]) => void = () => {};
    const fetchOptions = () =>
      new Promise<string[]>(done => {
        resolve = done;
      });

    const AsyncSelect = () => {
      const data = useAsyncOptions<string, string>({
        fetch: fetchOptions,
        getOption: item => ({ value: item, label: item }),
      });

      return <Select<string> aria-label="Город" hideEmpty {...data} />;
    };

    render(<AsyncSelect />);
    fireEvent.click(screen.getByRole("combobox", { name: "Город" }));

    const listbox = await screen.findByRole("listbox");

    expect(within(listbox).getByRole("status")).toHaveTextContent("Загрузка…");

    await act(async () => resolve(["Минск"]));
    expect(screen.getByRole("option", { name: "Минск" })).toBeInTheDocument();
  });
});
