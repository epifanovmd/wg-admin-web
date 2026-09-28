import { IUserStore } from "@entities/user";
import { IMainApi } from "@shared/api";
import { iocContainer } from "@shared/lib/di";
import { INotificationService } from "@shared/lib/notifications";
import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useWgForwardFormVM } from "../useWgForwardFormVM";

const api = {
  wgNodeOptions: vi.fn().mockResolvedValue({ data: [] }),
  listWgInterfaces: vi.fn().mockResolvedValue({
    data: {
      items: [{ id: "i1", name: "wg0", nodeId: "nl", listenPort: 51820 }],
    },
  }),
};

beforeEach(() => {
  iocContainer.bind(IMainApi.Tid).toConstantValue(api);
  iocContainer
    .bind(INotificationService.Tid)
    .toConstantValue({ error: vi.fn(), success: vi.fn() });
  iocContainer
    .bind(IUserStore.Tid)
    .toConstantValue({ user: { id: "u1" }, can: () => true });
});

afterEach(() => {
  vi.clearAllMocks();
  iocContainer.unbind(IMainApi.Tid);
  iocContainer.unbind(INotificationService.Tid);
  iocContainer.unbind(IUserStore.Tid);
});

describe("useWgForwardFormVM", () => {
  it("UDP на порт интерфейса панели ноды-цели — подсказка про точку через релей", async () => {
    const { result } = renderHook(() =>
      useWgForwardFormVM({ onSaved: vi.fn() }),
    );

    act(() => result.current.openCreate());
    act(() => {
      result.current.form.setValue("protocol", "udp");
      result.current.form.setValue("targetNodeId", "nl");
      result.current.form.setValue("targetPort", 51820);
    });

    await waitFor(() =>
      expect(result.current.panelInterface?.name).toBe("wg0"),
    );
    expect(api.listWgInterfaces).toHaveBeenCalledWith({
      hostNodeId: "nl",
      limit: 100,
    });

    act(() => result.current.form.setValue("protocol", "tcp"));
    expect(result.current.panelInterface).toBeNull();
  });
});
