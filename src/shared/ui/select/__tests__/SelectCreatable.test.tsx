import { act, fireEvent, render, screen } from "@testing-library/react";
import * as React from "react";

import { Select } from "../Select";
import { useStaticOptions } from "../strategies/use-static-options";
import type { SelectCreateHandler, SelectOption } from "../types";

const INITIAL: SelectOption<string>[] = [
  { value: "react", label: "React" },
  { value: "vue", label: "Vue" },
];

interface HarnessProps {
  multi?: boolean;
  onCreate: (
    query: string,
    add: (option: SelectOption<string>) => void,
  ) => ReturnType<SelectCreateHandler<string>>;
  onChange?: (value: unknown) => void;
  createLabel?: (query: string) => React.ReactNode;
}

const Harness = ({ multi, onCreate, onChange, createLabel }: HarnessProps) => {
  const [options, setOptions] = React.useState(INITIAL);
  const [single, setSingle] = React.useState<string>();
  const [many, setMany] = React.useState<string[]>([]);
  const data = useStaticOptions(options, { search: true });

  const add = (option: SelectOption<string>) =>
    setOptions(prev => [...prev, option]);
  const handleCreate = (query: string) => onCreate(query, add);

  if (multi) {
    return (
      <Select<string>
        {...data}
        aria-label="Теги"
        multi
        creatable
        createLabel={createLabel}
        onCreate={handleCreate}
        value={many}
        onChange={(next: string[]) => {
          setMany(next);
          onChange?.(next);
        }}
      />
    );
  }

  return (
    <Select<string>
      {...data}
      aria-label="Теги"
      creatable
      createLabel={createLabel}
      onCreate={handleCreate}
      value={single}
      onChange={next => {
        setSingle(next);
        onChange?.(next);
      }}
    />
  );
};

const type = (text: string) => {
  const input = screen.getByRole("combobox", { name: "Теги" });

  fireEvent.keyDown(input, { key: text[0] });
  fireEvent.change(input, { target: { value: text } });

  return input;
};

const addOption = (
  query: string,
  add: (option: SelectOption<string>) => void,
) => {
  const value = query.toLowerCase();

  add({ value, label: query });

  return value;
};

describe("Select creatable", () => {
  it("показывает пункт «Создать» первым и выбирает созданное (sync)", () => {
    const onChange = vi.fn();

    render(<Harness onCreate={addOption} onChange={onChange} />);
    type("Svelte");

    const options = screen.getAllByRole("option");

    expect(options[0]).toHaveTextContent("Создать «Svelte»");

    fireEvent.click(options[0]);

    expect(onChange).toHaveBeenCalledWith("svelte");
    expect(screen.getByRole("combobox", { name: "Теги" })).toBeInTheDocument();
    expect(screen.queryByRole("listbox")).toBeNull();
  });

  it("выбирает значение из Promise (async) в multi", async () => {
    const onChange = vi.fn();
    let resolve: (value: string) => void = () => {};

    render(
      <Harness
        multi
        onChange={onChange}
        onCreate={(query, add) =>
          new Promise<string>(done => {
            resolve = done;
          }).then(value => {
            add({ value, label: query });

            return value;
          })
        }
      />,
    );
    type("Solid");
    fireEvent.click(screen.getByRole("option", { name: "Создать «Solid»" }));

    expect(onChange).not.toHaveBeenCalled();

    await act(async () => resolve("solid"));

    expect(onChange).toHaveBeenCalledWith(["solid"]);
  });

  it("не выбирает ничего, если onCreate вернул undefined", () => {
    const onChange = vi.fn();
    const onCreate = vi.fn((_query: string) => undefined);

    render(<Harness onCreate={onCreate} onChange={onChange} />);
    type("Angular");
    fireEvent.click(screen.getByRole("option", { name: "Создать «Angular»" }));

    expect(onCreate.mock.calls[0]?.[0]).toBe("Angular");
    expect(onChange).not.toHaveBeenCalled();
  });

  it("прячет пункт «Создать» при точном совпадении без учёта регистра", () => {
    render(<Harness onCreate={addOption} />);
    type("react");

    expect(screen.queryByText(/Создать/)).toBeNull();
    expect(screen.getByRole("option", { name: "React" })).toBeInTheDocument();
  });

  it("показывает пункт «Создать» и при частичном совпадении", () => {
    render(<Harness onCreate={addOption} />);
    type("Re");

    const options = screen.getAllByRole("option");

    expect(options).toHaveLength(2);
    expect(options[0]).toHaveTextContent("Создать «Re»");
  });

  it("подсвечивает пункт «Создать», Enter создаёт; стрелки ходят к опциям", () => {
    const onChange = vi.fn();

    render(<Harness onCreate={addOption} onChange={onChange} />);

    const input = type("Re");
    const [create, react] = screen.getAllByRole("option");

    expect(input).toHaveAttribute("aria-activedescendant", create.id);

    fireEvent.keyDown(input, { key: "ArrowDown" });
    expect(input).toHaveAttribute("aria-activedescendant", react.id);

    fireEvent.keyDown(input, { key: "ArrowUp" });
    fireEvent.keyDown(input, { key: "Enter" });

    expect(onChange).toHaveBeenCalledWith("re");
  });

  it("Enter по опции под пунктом «Создать» выбирает опцию", () => {
    const onChange = vi.fn();

    render(<Harness onCreate={addOption} onChange={onChange} />);

    const input = type("Vu");

    fireEvent.keyDown(input, { key: "ArrowDown" });
    fireEvent.keyDown(input, { key: "Enter" });

    expect(onChange).toHaveBeenCalledWith("vue");
  });

  it("принимает кастомную подпись пункта", () => {
    render(
      <Harness
        onCreate={addOption}
        createLabel={query => `Добавить тег ${query}`}
      />,
    );
    type("Ember");

    expect(
      screen.getByRole("option", { name: "Добавить тег Ember" }),
    ).toBeInTheDocument();
  });

  it("повторное создание выбранного значения в multi не снимает его", () => {
    const onChange = vi.fn();

    render(<Harness multi onChange={onChange} onCreate={() => "react"} />);
    fireEvent.click(screen.getByRole("combobox", { name: "Теги" }));
    fireEvent.click(screen.getByRole("option", { name: "React" }));
    onChange.mockClear();

    type("Реакт");
    fireEvent.click(screen.getByRole("option", { name: "Создать «Реакт»" }));

    expect(onChange).not.toHaveBeenCalled();
  });
});
