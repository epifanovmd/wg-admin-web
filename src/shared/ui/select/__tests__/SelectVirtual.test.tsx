import { fireEvent, render, screen, within } from "@testing-library/react";

import { GroupedSelect } from "../GroupedSelect";
import { Select } from "../Select";
import type { SelectOption } from "../types";

const LIST_HEIGHT = 240;
const ROW = 32;

const OPTIONS: SelectOption<string>[] = Array.from(
  { length: 1000 },
  (_, i) => ({ value: `v${i + 1}`, label: `Опция ${i + 1}` }),
);

const originalOffsetHeight = Object.getOwnPropertyDescriptor(
  HTMLElement.prototype,
  "offsetHeight",
);

/** jsdom не считает layout: listbox — LIST_HEIGHT, строки — ROW. */
const mockLayout = () => {
  Object.defineProperty(HTMLElement.prototype, "offsetHeight", {
    configurable: true,
    get() {
      return (this as HTMLElement).getAttribute("role") === "listbox"
        ? LIST_HEIGHT
        : ROW;
    },
  });
};

const restoreLayout = () => {
  if (originalOffsetHeight) {
    Object.defineProperty(
      HTMLElement.prototype,
      "offsetHeight",
      originalOffsetHeight,
    );
  }
};

describe("Select virtual", () => {
  beforeEach(mockLayout);
  afterEach(restoreLayout);

  it("рендерит только окно из 1000 опций", () => {
    render(<Select<string> aria-label="Опции" virtual options={OPTIONS} />);
    fireEvent.click(screen.getByRole("combobox", { name: "Опции" }));

    const options = within(screen.getByRole("listbox")).getAllByRole("option");

    expect(options.length).toBeGreaterThan(0);
    expect(options.length).toBeLessThan(40);
    expect(options[0]).toHaveAttribute("aria-setsize", "1000");
    expect(options[0]).toHaveAttribute("aria-posinset", "1");
  });

  it("ArrowDown до 50-й опции держит её в DOM и активной", () => {
    const onChange = vi.fn();

    render(
      <Select<string>
        aria-label="Опции"
        virtual={{ estimateSize: ROW, overscan: 2 }}
        options={OPTIONS}
        onChange={onChange}
      />,
    );

    const trigger = screen.getByRole("combobox", { name: "Опции" });

    fireEvent.keyDown(trigger, { key: "ArrowDown" });
    for (let i = 1; i < 50; i += 1) {
      fireEvent.keyDown(trigger, { key: "ArrowDown" });
    }

    const active = screen.getByRole("option", { name: "Опция 50" });

    expect(trigger).toHaveAttribute("aria-activedescendant", active.id);
    expect(active).toHaveAttribute("aria-posinset", "50");

    fireEvent.keyDown(trigger, { key: "Enter" });
    expect(onChange).toHaveBeenCalledWith("v50");
  });

  it("End переходит к последней опции", () => {
    render(<Select<string> aria-label="Опции" virtual options={OPTIONS} />);

    const trigger = screen.getByRole("combobox", { name: "Опции" });

    fireEvent.keyDown(trigger, { key: "ArrowDown" });
    fireEvent.keyDown(trigger, { key: "End" });

    expect(trigger).toHaveAttribute(
      "aria-activedescendant",
      screen.getByRole("option", { name: "Опция 1000" }).id,
    );
  });

  it("показывает заголовки групп строками плоского списка", () => {
    render(
      <GroupedSelect<string>
        aria-label="Опции"
        virtual
        groups={[
          { group: "Первые", options: OPTIONS.slice(0, 2) },
          { group: "Вторые", options: OPTIONS.slice(2, 4) },
        ]}
      />,
    );
    fireEvent.click(screen.getByRole("combobox", { name: "Опции" }));

    const listbox = screen.getByRole("listbox");

    expect(within(listbox).getByText("Первые")).toHaveAttribute(
      "role",
      "presentation",
    );
    expect(within(listbox).getByText("Вторые")).toBeInTheDocument();
    expect(within(listbox).getAllByRole("option")).toHaveLength(4);
  });
});
