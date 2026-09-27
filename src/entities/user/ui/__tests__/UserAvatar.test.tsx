import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { UserAvatar } from "../UserAvatar";

describe("UserAvatar", () => {
  it("без изображения показывает инициалы имени", () => {
    render(<UserAvatar name="Иван Петров" />);

    expect(screen.getByText("ИП")).toBeInTheDocument();
  });

  it("без имени показывает знак вопроса", () => {
    render(<UserAvatar name="" />);

    expect(screen.getByText("?")).toBeInTheDocument();
  });
});
