import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { PageLayout } from "../PageLayout";

const contentOf = (text: string) => screen.getByText(text).parentElement!;

describe("PageLayout", () => {
  it("обычная страница: содержимое не сжимается до прокрутки — нижний отступ остаётся под контентом", () => {
    render(
      <PageLayout>
        <p>контент</p>
      </PageLayout>,
    );

    const content = contentOf("контент");

    expect(content.className).toContain("shrink-0");
    expect(content.className).not.toContain("min-h-0");
    expect(content.className).toMatch(/pb-\d+/);
  });

  it("fill: содержимое по высоте экрана — таблица прокручивается внутри", () => {
    render(
      <PageLayout fill>
        <p>таблица</p>
      </PageLayout>,
    );

    const content = contentOf("таблица");

    expect(content.className).toContain("min-h-0");
    expect(content.className).not.toContain("shrink-0");
  });
});
