import { IAgentsStore } from "@entities/agent";
import { IUserStore } from "@entities/user";
import { IMainApi } from "@shared/api";
import type { AgentDto } from "@shared/api/gen/main/model";
import { createFakeAccess } from "@shared/lib/access/testing";
import { iocContainer } from "@shared/lib/di";
import { INotificationService } from "@shared/lib/notifications";
import { ISocketTransport } from "@shared/lib/socket";
import { createFakeSocket } from "@shared/lib/socket/testing";
import { renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useAgentsVM } from "../useAgentsVM";

vi.mock("@shared/ui", async importOriginal => ({
  ...(await importOriginal<object>()),
  useConfirm: () => vi.fn(),
}));

const agent = (patch: Partial<AgentDto> = {}) =>
  ({
    id: "a-1",
    name: "node-01",
    online: true,
    revoked: false,
    workers: [],
    ...patch,
  }) as AgentDto;

const store = {
  agents: [] as AgentDto[],
  alerts: [],
  isLoading: false,
  error: null,
  load: vi.fn(),
  loadRelease: vi.fn(),
  updateCandidate: vi.fn(),
  upsert: vi.fn(),
  remove: vi.fn(),
};
let permissions: string[];

beforeEach(() => {
  permissions = ["agent:view", "agent:manage"];
  store.updateCandidate.mockReturnValue({ target: "1.2.0" });
  iocContainer.bind(IAgentsStore.Tid).toConstantValue(store);
  iocContainer
    .bind(IUserStore.Tid)
    .toConstantValue(createFakeAccess({ userId: "u", permissions }));
  iocContainer.bind(IMainApi.Tid).toConstantValue({});
  iocContainer.bind(INotificationService.Tid).toConstantValue({});
  iocContainer.bind(ISocketTransport.Tid).toConstantValue(createFakeSocket());
});

afterEach(() => {
  iocContainer.unbind(IAgentsStore.Tid);
  iocContainer.unbind(IUserStore.Tid);
  iocContainer.unbind(IMainApi.Tid);
  iocContainer.unbind(INotificationService.Tid);
  iocContainer.unbind(ISocketTransport.Tid);
  vi.clearAllMocks();
});

describe("useAgentsVM", () => {
  it("с правом просмотра грузит агентов и сборки", () => {
    renderHook(() => useAgentsVM());

    expect(store.load).toHaveBeenCalled();
    expect(store.loadRelease).toHaveBeenCalled();
  });

  it("без права просмотра ничего не грузит", () => {
    permissions.length = 0;
    renderHook(() => useAgentsVM());

    expect(store.load).not.toHaveBeenCalled();
  });

  it("действия по строке: обновить и сменить ключ — только на связи", () => {
    const { result } = renderHook(() => useAgentsVM());

    expect(result.current.accessOf(agent())).toEqual({
      updateTo: "1.2.0",
      canRotate: true,
      canRevoke: true,
      canDelete: true,
    });
    expect(result.current.accessOf(agent({ online: false }))).toEqual({
      updateTo: null,
      canRotate: false,
      canRevoke: true,
      canDelete: true,
    });
  });

  it("удалить — с правом управления; без него — ничего", () => {
    const { result, rerender } = renderHook(() => useAgentsVM());

    expect(result.current.accessOf(agent({ revoked: true })).canDelete).toBe(
      true,
    );

    permissions.splice(permissions.indexOf("agent:manage"), 1);
    rerender();

    expect(result.current.accessOf(agent({ revoked: true }))).toEqual({
      updateTo: null,
      canRotate: false,
      canRevoke: false,
      canDelete: false,
    });
  });
});
