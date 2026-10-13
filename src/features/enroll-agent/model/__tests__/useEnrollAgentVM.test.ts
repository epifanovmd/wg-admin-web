import { IMainApi } from "@shared/api";
import { iocContainer } from "@shared/lib/di";
import { INotificationService } from "@shared/lib/notifications";
import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useEnrollAgentVM } from "../useEnrollAgentVM";
import { INSTALL_DEFAULTS, installCommandSchema } from "../validation";

const confirm = vi.fn();

vi.mock("@shared/ui", async importOriginal => ({
  ...(await importOriginal<object>()),
  useConfirm: () => confirm,
}));

const tokenDto = {
  id: "t-1",
  name: "eu",
  prefix: "abcd1234",
  labels: {},
  maxUses: 1,
  uses: 0,
  expiresAt: undefined,
  revokedAt: undefined,
  createdBy: undefined,
  createdAt: "2026-10-08T00:00:00Z",
};

const api = {
  getAgentEnrollmentTokens: vi.fn(),
  createAgentEnrollmentToken: vi.fn(),
  revokeAgentEnrollmentToken: vi.fn(),
  createAgentInstallCommand: vi.fn(),
};
const toast = { error: vi.fn(), success: vi.fn(), info: vi.fn() };

beforeEach(() => {
  api.getAgentEnrollmentTokens.mockResolvedValue({
    data: { items: [], total: 0 },
  });
  iocContainer.bind(IMainApi.Tid).toConstantValue(api);
  iocContainer.bind(INotificationService.Tid).toConstantValue(toast);
});

afterEach(() => {
  iocContainer.unbind(IMainApi.Tid);
  iocContainer.unbind(INotificationService.Tid);
  vi.clearAllMocks();
});

describe("useEnrollAgentVM", () => {
  it("токены грузятся только при открытом окне", async () => {
    const { result } = renderHook(() => useEnrollAgentVM());

    expect(api.getAgentEnrollmentTokens).not.toHaveBeenCalled();
    act(() => result.current.openDialog());
    await waitFor(() =>
      expect(api.getAgentEnrollmentTokens).toHaveBeenCalledWith({
        limit: 100,
      }),
    );
  });

  it("созданный токен показывается и подставляется в команду", async () => {
    api.createAgentEnrollmentToken.mockResolvedValue({
      data: { enrollmentToken: tokenDto, token: "abcd1234.secret" },
    });

    const { result } = renderHook(() => useEnrollAgentVM());

    await act(() =>
      result.current.createToken({
        name: "eu",
        expiry: "never",
        singleUse: true,
        labels: { zone: "eu" },
      }),
    );

    expect(api.createAgentEnrollmentToken).toHaveBeenCalledWith({
      name: "eu",
      labels: { zone: "eu" },
      maxUses: 1,
      expiresAt: undefined,
    });
    expect(result.current.issued).toBe("abcd1234.secret");
    expect(result.current.installForm.getValues("token")).toBe(
      "abcd1234.secret",
    );
  });

  it("команда установки: умолчания не уходят серверу", async () => {
    api.createAgentInstallCommand.mockResolvedValue({
      data: { command: "curl … | sudo sh" },
    });

    const { result } = renderHook(() => useEnrollAgentVM());

    await act(() =>
      result.current.createCommand(
        installCommandSchema.parse({ ...INSTALL_DEFAULTS, token: "p.s" }),
      ),
    );

    const body = api.createAgentInstallCommand.mock.calls[0][0];

    expect(body.token).toBe("p.s");
    expect(
      Object.entries(body).filter(([, value]) => value !== undefined),
    ).toEqual([["token", "p.s"]]);
    expect(result.current.command).toBe("curl … | sudo sh");
  });

  it("отзыв токена — после подтверждения", async () => {
    confirm.mockResolvedValue(false);

    const { result } = renderHook(() => useEnrollAgentVM());

    await act(() => result.current.revokeToken(tokenDto));
    expect(api.revokeAgentEnrollmentToken).not.toHaveBeenCalled();

    confirm.mockResolvedValue(true);
    api.revokeAgentEnrollmentToken.mockResolvedValue({ data: undefined });
    await act(() => result.current.revokeToken(tokenDto));
    expect(api.revokeAgentEnrollmentToken).toHaveBeenCalledWith("t-1");
  });
});
