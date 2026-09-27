import { render, screen } from "@testing-library/react";

import { Card } from "../Card";
import { CardContent } from "../CardContent";
import { CardHeader } from "../CardHeader";
import { CardTitle } from "../CardTitle";

describe("Card", () => {
  it("не оборачивает составные секции во второй CardContent", () => {
    render(
      <Card data-testid="card">
        <CardHeader data-testid="header">
          <CardTitle>Заголовок</CardTitle>
        </CardHeader>
        <CardContent>Текст</CardContent>
      </Card>,
    );

    expect(screen.getByTestId("header").parentElement).toBe(
      screen.getByTestId("card"),
    );
  });

  it("в шорткате кладёт children в CardContent под шапкой", () => {
    render(
      <Card data-testid="card" title="Заголовок" contentClassName="content">
        Текст
      </Card>,
    );

    const card = screen.getByTestId("card");

    expect(
      screen.getByRole("heading", { name: "Заголовок" }),
    ).toBeInTheDocument();
    expect(card.lastElementChild).toHaveClass("content");
    expect(card.lastElementChild).toHaveTextContent("Текст");
  });

  it("contentClassName без шортката тоже оборачивает children в CardContent", () => {
    render(
      <Card data-testid="card" contentClassName="content">
        Текст
      </Card>,
    );

    const content = screen.getByTestId("card").firstElementChild;

    expect(content).toHaveClass("content");
    expect(content).toHaveTextContent("Текст");
  });

  it("interactive выбирает эффект наведения из общих утилит движения", () => {
    const { rerender } = render(<Card data-testid="card" interactive="lift" />);

    expect(screen.getByTestId("card")).toHaveClass("hover-lift");

    rerender(<Card data-testid="card" interactive="surface" />);
    expect(screen.getByTestId("card")).toHaveClass("hover-surface");
    expect(screen.getByTestId("card")).not.toHaveClass("hover-lift");
  });
});
