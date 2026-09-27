import { render, screen } from "@testing-library/react";

import { StatCard } from "../StatCard";

describe("StatCard", () => {
  it("кладёт содержимое в секцию с отступами, а не прямо в рамку", () => {
    render(<StatCard data-testid="stat" title="Пользователи" value="1 284" />);

    const content = screen.getByText("Пользователи").closest(".p-3");

    expect(content).not.toBeNull();
    expect(content?.parentElement).toBe(screen.getByTestId("stat"));
  });
});

describe("StatCard: узкая карточка", () => {
  it("значок — в строке заголовка, значение на всю ширину и не обрезается", () => {
    render(
      <StatCard
        title="Интерфейсы"
        value="135.2 Мбит/с"
        icon={<svg data-testid="icon" />}
      />,
    );

    const value = screen.getByText("135.2 Мбит/с");
    const titleRow = screen.getByText("Интерфейсы").parentElement;

    expect(titleRow?.contains(screen.getByTestId("icon"))).toBe(true);
    expect(titleRow?.contains(value)).toBe(false);
    expect(value.className).not.toMatch(/\btruncate\b/);
  });
});
