import { fireEvent, render, screen, within } from "@testing-library/react";

import { GroupedSelect } from "../GroupedSelect";

const GROUPS = [
  { group: "Фрукты", options: [{ value: "apple", label: "Яблоко" }] },
  { group: "Овощи", options: [{ value: "carrot", label: "Морковь" }] },
];

describe("GroupedSelect", () => {
  it("рендерит именованные группы опций", () => {
    render(<GroupedSelect aria-label="Продукт" groups={GROUPS} />);

    fireEvent.click(screen.getByRole("combobox", { name: "Продукт" }));

    const vegetables = screen.getByRole("group", { name: "Овощи" });

    expect(
      within(vegetables).getByRole("option", { name: "Морковь" }),
    ).toBeInTheDocument();
  });

  it("клавиатура переходит между группами", () => {
    const onChange = vi.fn();

    render(
      <GroupedSelect
        aria-label="Продукт"
        groups={GROUPS}
        onChange={onChange}
      />,
    );

    const trigger = screen.getByRole("combobox", { name: "Продукт" });

    fireEvent.keyDown(trigger, { key: "ArrowDown" });
    fireEvent.keyDown(trigger, { key: "ArrowDown" });
    fireEvent.keyDown(trigger, { key: "Enter" });

    expect(onChange).toHaveBeenCalledWith("carrot");
  });
});
