import { IMainApi } from "@shared/api";
import { iocContainer } from "@shared/lib/di";
import { INotificationService } from "@shared/lib/notifications";
import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useWgNodeFormVM } from "../useWgNodeFormVM";

const created = {
  node: { id: "n1", name: "example" },
  install: {
    command: "curl … | sudo sh -s -- --instance wg --token t",
    token: "t",
    tokenId: "k1",
    expiresAt: "2026-10-10T00:00:00.000Z",
  },
};
const api = { createWgNode: vi.fn() };

beforeEach(() => {
  api.createWgNode.mockResolvedValue({ data: created });
  iocContainer.bind(IMainApi.Tid).toConstantValue(api);
  iocContainer
    .bind(INotificationService.Tid)
    .toConstantValue({ error: vi.fn(), success: vi.fn() });
});

afterEach(() => {
  iocContainer.unbind(IMainApi.Tid);
  iocContainer.unbind(INotificationService.Tid);
});

describe("useWgNodeFormVM", () => {
  it("создание — нода сохранена, команда установки показывается", async () => {
    const onSaved = vi.fn();
    const { result } = renderHook(() => useWgNodeFormVM({ onSaved }));

    act(() => result.current.openCreate());
    await act(async () =>
      result.current.submit({
        name: "example",
        publicHost: "",
        description: "",
      }),
    );

    expect(onSaved).toHaveBeenCalledWith(created.node);
    expect(result.current.issued).toEqual(created.install);
    expect(result.current.open).toBe(true);
  });
});
