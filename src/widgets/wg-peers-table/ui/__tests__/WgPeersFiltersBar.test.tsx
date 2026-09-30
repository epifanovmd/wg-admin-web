import { IMainApi } from "@shared/api";
import { iocContainer } from "@shared/lib/di";
import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { WgPeersFiltersBar } from "../WgPeersFiltersBar";

const api = {
  wgNodeOptions: vi.fn().mockResolvedValue({ data: [] }),
  wgInterfaceOptions: vi.fn().mockResolvedValue({ data: [] }),
  getUserOptions: vi.fn().mockResolvedValue({ data: { data: [] } }),
};

beforeEach(() => iocContainer.bind(IMainApi.Tid).toConstantValue(api));
afterEach(() => {
  iocContainer.unbind(IMainApi.Tid);
  vi.clearAllMocks();
});

describe("WgPeersFiltersBar", () => {
  it("«Только онлайн» и «Сбросить» — через onChange; на странице интерфейса узел не сбрасывается", () => {
    const onChange = vi.fn();

    render(
      <WgPeersFiltersBar
        filters={{ online: true, query: "ip" }}
        onChange={onChange}
        withLocation={false}
        withOwner={false}
      />,
    );

    expect(screen.queryByText("Все ноды")).toBeNull();
    expect(api.wgNodeOptions).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("switch"));
    expect(onChange).toHaveBeenLastCalledWith({ online: undefined });

    fireEvent.click(screen.getByText("Сбросить"));
    expect(onChange).toHaveBeenLastCalledWith({
      query: undefined,
      userId: undefined,
      mine: undefined,
      enabled: undefined,
      online: undefined,
    });
  });

  it("без фильтров кнопки сброса нет; выбор ноды и интерфейса показан", () => {
    render(<WgPeersFiltersBar filters={{}} onChange={vi.fn()} withOwner />);

    expect(screen.queryByText("Сбросить")).toBeNull();
    expect(screen.getByText("Все ноды")).toBeTruthy();
    expect(screen.getByText("Все интерфейсы")).toBeTruthy();
    expect(screen.getByText("Все держатели")).toBeTruthy();
  });

  it("«Все / Мои» — только тем, кто видит пиры всех", () => {
    const onChange = vi.fn();
    const view = render(
      <WgPeersFiltersBar filters={{}} onChange={onChange} withOwner />,
    );

    fireEvent.click(screen.getByRole("radio", { name: "Мои" }));
    expect(onChange).toHaveBeenLastCalledWith({ mine: true });

    view.rerender(
      <WgPeersFiltersBar filters={{}} onChange={onChange} withOwner={false} />,
    );
    expect(screen.queryByRole("radiogroup", { name: "Чьи пиры" })).toBeNull();
  });
});
