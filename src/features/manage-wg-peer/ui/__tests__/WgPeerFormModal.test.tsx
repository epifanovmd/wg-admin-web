import { IUserStore } from "@entities/user";
import { IMainApi } from "@shared/api";
import { createFakeAccess } from "@shared/lib/access/testing";
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
  iocContainer
    .bind(IUserStore.Tid)
    .toConstantValue(createFakeAccess({ permissions: ["*"] }));
});

afterEach(() => {
  iocContainer.unbind(IMainApi.Tid);
  iocContainer.unbind(INotificationService.Tid);
  iocContainer.unbind(IUserStore.Tid);
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

  it("без права назначения поля «Держатель» нет", () => {
    iocContainer
      .rebind(IUserStore.Tid)
      .toConstantValue(
        createFakeAccess({ permissions: ["wg:peer:create", "user:view"] }),
      );

    const { result } = renderHook(() => useWgPeerFormVM({ onSaved: vi.fn() }));

    expect(result.current.canAssign).toBe(false);
  });

  it("право назначения своих — держателя можно выбрать при создании", () => {
    iocContainer.rebind(IUserStore.Tid).toConstantValue(
      createFakeAccess({
        permissions: ["wg:peer:create", "wg:peer:assign:own", "user:view"],
      }),
    );

    const { result } = renderHook(() => useWgPeerFormVM({ onSaved: vi.fn() }));

    expect(result.current.canAssign).toBe(true);
  });
});
