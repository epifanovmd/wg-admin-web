import { IMainApi } from "@shared/api";
import type { WgNodeDto } from "@shared/api/gen/main/model";
import { iocContainer } from "@shared/lib/di";
import { INotificationService } from "@shared/lib/notifications";
import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useProvisionWgNodeVM } from "../useProvisionWgNodeVM";

const node = { id: "n1", name: "msk", publicHost: "1.2.3.4" } as WgNodeDto;
const api = {
  provisionWgNode: vi.fn().mockResolvedValue({ data: { jobId: "j1" } }),
  uninstallWgNode: vi.fn().mockResolvedValue({ data: { jobId: "j2" } }),
};

beforeEach(() => {
  iocContainer.bind(IMainApi.Tid).toConstantValue(api);
  iocContainer
    .bind(INotificationService.Tid)
    .toConstantValue({ error: vi.fn(), success: vi.fn() });
});

afterEach(() => {
  iocContainer.unbind(IMainApi.Tid);
  iocContainer.unbind(INotificationService.Tid);
  vi.clearAllMocks();
});

describe("useProvisionWgNodeVM", () => {
  it("режим удаления — uninstallWgNode без URL бэкенда", async () => {
    const { result } = renderHook(() => useProvisionWgNodeVM({}));

    act(() => result.current.openFor(node, "uninstall"));
    await act(async () =>
      result.current.submit({
        host: "1.2.3.4",
        port: 22,
        username: "root",
        privateKey: "",
        password: "secret",
        backendUrl: "http://ignored",
      }),
    );

    expect(api.provisionWgNode).not.toHaveBeenCalled();
    expect(api.uninstallWgNode).toHaveBeenCalledWith("n1", {
      host: "1.2.3.4",
      port: 22,
      username: "root",
      privateKey: undefined,
      password: "secret",
    });
    expect(result.current.jobId).toBe("j2");
  });

  it("по умолчанию — установка", async () => {
    const { result } = renderHook(() => useProvisionWgNodeVM({}));

    act(() => result.current.openFor(node));
    await act(async () =>
      result.current.submit({
        host: "1.2.3.4",
        port: 22,
        username: "root",
        privateKey: "",
        password: "secret",
        backendUrl: "",
      }),
    );

    expect(api.provisionWgNode).toHaveBeenCalledOnce();
    expect(api.uninstallWgNode).not.toHaveBeenCalled();
  });
});
