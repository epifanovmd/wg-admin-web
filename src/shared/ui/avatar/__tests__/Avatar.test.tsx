import { fireEvent, render, screen } from "@testing-library/react";

import { Avatar } from "../Avatar";

describe("Avatar", () => {
  it("exposes initials fallback with an accessible name", () => {
    render(<Avatar name="Иван Петров" />);

    expect(screen.getByRole("img", { name: "Иван Петров" })).toHaveTextContent(
      "ИП",
    );
  });

  it("условный пустой children (`{cond && <Icon/>}`) не прячет инициалы", () => {
    render(<Avatar name="Аудит">{false}</Avatar>);

    expect(screen.getByRole("img", { name: "Аудит" })).toHaveTextContent("А");
  });

  it("retries the image when src changes after an error", () => {
    const { rerender } = render(<Avatar src="/a.png" name="Anna" />);

    fireEvent.error(screen.getByRole("img"));
    expect(screen.queryByRole("img", { name: "Anna" })).toHaveTextContent("A");

    rerender(<Avatar src="/b.png" name="Anna" />);

    expect(screen.getByRole("img")).toHaveAttribute("src", "/b.png");
  });
});
