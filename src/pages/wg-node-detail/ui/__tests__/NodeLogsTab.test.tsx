import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { NodeLogsRefreshButton } from "../NodeLogsRefreshButton";
import { NodeLogsTab } from "../NodeLogsTab";

describe("NodeLogsTab", () => {
  it("прежний журнал виден, пока идёт обновление", () => {
    render(<NodeLogsTab logs="строка 1" loading error={null} />);

    expect(screen.getByText("строка 1")).toBeInTheDocument();
  });

  it("ошибка — в самой вкладке", () => {
    render(
      <NodeLogsTab
        logs={null}
        loading={false}
        error="Агент ноды не на связи"
      />,
    );

    expect(screen.getByText("Агент ноды не на связи")).toBeInTheDocument();
  });
});

describe("NodeLogsRefreshButton", () => {
  it("«Обновить» запрашивает журнал", () => {
    const onLoad = vi.fn();

    render(<NodeLogsRefreshButton loading={false} onLoad={onLoad} />);
    fireEvent.click(screen.getByRole("button", { name: /Обновить/ }));

    expect(onLoad).toHaveBeenCalledOnce();
  });
});
