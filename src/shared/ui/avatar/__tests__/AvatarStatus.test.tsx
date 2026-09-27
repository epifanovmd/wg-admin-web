import { render, screen } from "@testing-library/react";

import { Avatar } from "../Avatar";
import { AvatarGroup } from "../AvatarGroup";

describe("Avatar status", () => {
  it("включает статус в доступное имя fallback-аватара", () => {
    const { container } = render(<Avatar name="Иван Петров" status="online" />);

    expect(
      screen.getByRole("img", { name: "Иван Петров, В сети" }),
    ).toBeInTheDocument();

    const dot = container.querySelector("[data-status='online']");

    expect(dot).toHaveAttribute("aria-hidden", "true");
    expect(dot).toHaveClass("bg-success");
  });

  it("подписывает точку статуса отдельно у аватара с изображением", () => {
    render(<Avatar src="/a.png" name="Anna" status="busy" />);

    expect(screen.getByRole("img", { name: "Anna" })).toHaveAttribute(
      "src",
      "/a.png",
    );
    expect(screen.getByRole("img", { name: "Занят" })).toHaveClass(
      "bg-destructive",
    );
  });

  it.each([
    ["away", "Отошёл", "bg-warning"],
    ["offline", "Не в сети", "bg-muted-foreground"],
  ] as const)("статус %s → «%s»", (status, label, color) => {
    render(<Avatar status={status} />);

    expect(screen.getByRole("img", { name: label })).toHaveClass(color);
  });

  it("размер точки следует размеру аватара", () => {
    const { container } = render(<Avatar name="A" size="xl" status="away" />);

    expect(container.querySelector("[data-status]")).toHaveClass("size-3.5");
  });

  it("не рендерит точку без статуса", () => {
    const { container } = render(<Avatar name="A" />);

    expect(container.querySelector("[data-status]")).toBeNull();
  });

  it("сохраняет статус внутри AvatarGroup", () => {
    render(
      <AvatarGroup size="sm">
        <Avatar name="Anna" status="online" />
        <Avatar name="Boris" />
      </AvatarGroup>,
    );

    expect(
      screen.getByRole("img", { name: "Anna, В сети" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Boris" })).toBeInTheDocument();
  });
});
