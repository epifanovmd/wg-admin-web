import { render, screen } from "@testing-library/react";

import { Skeleton } from "../Skeleton";
import { SkeletonAvatar } from "../SkeletonAvatar";
import { SkeletonGroup } from "../SkeletonGroup";
import { SkeletonRow } from "../SkeletonRow";
import { SkeletonText } from "../SkeletonText";

describe("Skeleton", () => {
  it("скрыт от скринридера и принимает радиус и размеры", () => {
    render(<Skeleton data-testid="s" radius="full" className="h-4 w-10" />);

    const node = screen.getByTestId("s");

    expect(node).toHaveAttribute("aria-hidden", "true");
    expect(node).toHaveClass("animate-pulse", "rounded-full", "h-4", "w-10");
  });

  it("SkeletonText рисует заданное число строк, последняя короче", () => {
    render(<SkeletonText data-testid="t" lines={4} gap="lg" />);

    const root = screen.getByTestId("t");
    const lines = Array.from(root.children);

    expect(root).toHaveClass("gap-3");
    expect(lines).toHaveLength(4);
    expect(lines[3]).toHaveClass("w-3/5");
    expect(lines[0]).not.toHaveClass("w-3/5");
  });

  it("SkeletonText из одной строки не укорачивает её", () => {
    render(<SkeletonText data-testid="t" lines={1} />);

    expect(screen.getByTestId("t").firstElementChild).not.toHaveClass("w-3/5");
  });

  it("SkeletonAvatar использует шкалу размеров Avatar", () => {
    render(<SkeletonAvatar data-testid="a" size="lg" shape="square" />);

    expect(screen.getByTestId("a")).toHaveClass("h-12", "w-12", "rounded-lg");
  });

  it("SkeletonRow без аватара содержит только две строки", () => {
    render(<SkeletonRow data-testid="r" avatar={false} />);

    const text = screen.getByTestId("r").firstElementChild;

    expect(screen.getByTestId("r").children).toHaveLength(1);
    expect(text?.children).toHaveLength(2);
  });

  it("SkeletonGroup объявляет загрузку один раз", () => {
    render(
      <SkeletonGroup label="Загрузка списка">
        <SkeletonRow />
        <SkeletonRow />
      </SkeletonGroup>,
    );

    const status = screen.getByRole("status");

    expect(status).toHaveTextContent("Загрузка списка");
    expect(status).toHaveAttribute("aria-busy", "true");
  });
});
