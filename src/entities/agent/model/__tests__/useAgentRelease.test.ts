import { IMainApi } from "@shared/api";
import type { IAgentReleaseDto } from "@shared/api/gen/main/model";
import { iocContainer } from "@shared/lib/di";
import { INotificationService } from "@shared/lib/notifications";
import { ISocketTransport } from "@shared/lib/socket";
import { createFakeSocket, type IFakeSocket } from "@shared/lib/socket/testing";
import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useAgentRelease } from "../useAgentRelease";

const api = { getAgentRelease: vi.fn() };
const toast = { info: vi.fn(), success: vi.fn(), error: vi.fn() };
let socket: IFakeSocket;

const release = (...agents: string[]): { data: IAgentReleaseDto } => ({
  data: {
    manifest: null,
    candidates: agents.map(agentId => ({
      agentId,
      name: agentId,
      online: true,
      current: "1.2.1",
      target: "1.3.0",
      os: "linux",
      arch: "amd64",
      source: "agent",
    })),
    workerCandidates: [],
  },
});

beforeEach(() => {
  socket = createFakeSocket();
  iocContainer.bind(IMainApi.Tid).toConstantValue(api);
  iocContainer.bind(INotificationService.Tid).toConstantValue(toast);
  iocContainer.bind(ISocketTransport.Tid).toConstantValue(socket);
});

afterEach(() => {
  iocContainer.unbind(IMainApi.Tid);
  iocContainer.unbind(INotificationService.Tid);
  iocContainer.unbind(ISocketTransport.Tid);
  vi.clearAllMocks();
});

describe("useAgentRelease", () => {
  it("версия, найденная агентом после первого чтения, — уведомление; известные — без него", async () => {
    api.getAgentRelease.mockResolvedValueOnce(release("a-1"));

    const { result } = renderHook(() => useAgentRelease(true));

    await waitFor(() =>
      expect(result.current.data?.candidates).toHaveLength(1),
    );
    expect(toast.info).not.toHaveBeenCalled();

    api.getAgentRelease.mockResolvedValueOnce(release("a-1", "a-2"));
    await act(() => result.current.refresh());

    expect(toast.info).toHaveBeenCalledTimes(1);
    expect(toast.info.mock.calls[0][0]).toContain("«a-2»");
    expect(toast.info.mock.calls[0][1]).toEqual({
      id: "agent-found-a-2@1.3.0",
    });
  });

  it("agent:release — сборки перечитываются, о новой версии — уведомление", async () => {
    api.getAgentRelease.mockResolvedValue(release());
    renderHook(() => useAgentRelease(true));
    await waitFor(() => expect(api.getAgentRelease).toHaveBeenCalledTimes(1));

    act(() =>
      socket.fire("agent:release", {
        version: "1.3.0",
        previous: "1.2.1",
        from: "github:o/r",
      }),
    );

    expect(api.getAgentRelease).toHaveBeenCalledTimes(2);
    expect(toast.info).toHaveBeenCalledWith(
      "Доступна версия агента 1.3.0 (была 1.2.1)",
      { id: "agent-release-1.3.0" },
    );
  });
});
