import { IMainApi } from "@shared/api";
import { iocContainer } from "@shared/lib/di";
import { INotificationService } from "@shared/lib/notifications";
import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useWgNodeInstallCommandVM } from "../useWgNodeInstallCommandVM";

const install = (command: string) => ({
  data: { command, token: "t.s", tokenId: "t1", expiresAt: "2026-01-01" },
});
const api = {
  createWgNodeInstallCommand: vi
    .fn()
    .mockResolvedValueOnce(install("curl … | sudo sh"))
    .mockResolvedValueOnce(install("curl … && docker compose up -d --build")),
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

describe("useWgNodeInstallCommandVM", () => {
  it("служба по умолчанию; Docker — новая команда с mode: docker", async () => {
    const { result } = renderHook(() => useWgNodeInstallCommandVM("n1"));

    await act(() => result.current.issue());
    expect(api.createWgNodeInstallCommand).toHaveBeenLastCalledWith("n1", {});
    expect(result.current.mode).toBe("systemd");

    await act(() => result.current.issue("docker"));
    expect(api.createWgNodeInstallCommand).toHaveBeenLastCalledWith("n1", {
      mode: "docker",
    });
    expect(result.current.mode).toBe("docker");
    expect(result.current.install?.command).toContain("docker compose");
  });
});
