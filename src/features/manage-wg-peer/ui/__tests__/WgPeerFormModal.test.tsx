import { IMainApi } from "@shared/api";
import { iocContainer } from "@shared/lib/di";
import { INotificationService } from "@shared/lib/notifications";
import { act, render, renderHook, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useWgPeerFormVM } from "../../model/useWgPeerFormVM";
import { WgPeerFormModal } from "../WgPeerFormModal";

beforeEach(() => {
  iocContainer.bind(IMainApi.Tid).toConstantValue({
    wgInterfaceOptions: vi.fn().mockResolvedValue({ data: [] }),
    getUserOptions: vi.fn().mockResolvedValue({ data: { data: [] } }),
  });
  iocContainer
    .bind(INotificationService.Tid)
    .toConstantValue({ error: vi.fn(), success: vi.fn() });
});

afterEach(() => {
  iocContainer.unbind(IMainApi.Tid);
  iocContainer.unbind(INotificationService.Tid);
});

describe("WgPeerFormModal", () => {
  it("своей кнопки нет, создание открывается методом VM", () => {
    const { result } = renderHook(() => useWgPeerFormVM({ onSaved: vi.fn() }));
    const view = render(<WgPeerFormModal vm={result.current} />);

    expect(screen.queryByRole("button")).toBeNull();

    act(() => result.current.openCreate());
    view.rerender(<WgPeerFormModal vm={result.current} />);

    expect(screen.getByRole("dialog", { name: "Новый пир" })).toBeTruthy();
  });
});
