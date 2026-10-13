import { IMainApi } from "@shared/api";
import { iocContainer } from "@shared/lib/di";
import { ISocketTransport } from "@shared/lib/socket";
import { createFakeSocket, type IFakeSocket } from "@shared/lib/socket/testing";
import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { makeAgent } from "../../lib/__tests__/agent-fixture";
import { AgentsStore } from "../store";
import { IAgentsStore } from "../types";
import { useAgentReleaseWatch } from "../useAgentReleaseWatch";

const api = { getAgentRelease: vi.fn(), getAgents: vi.fn() };
let socket: IFakeSocket;
let store: AgentsStore;

beforeEach(() => {
  socket = createFakeSocket();
  store = new AgentsStore(api as unknown as IMainApi);
  api.getAgentRelease.mockResolvedValue({
    data: { bundle: true, workers: [] },
  });
  api.getAgents.mockResolvedValue({
    data: { items: [makeAgent({ updateAvailable: "1.3.0" })], total: 1 },
  });
  iocContainer.bind(ISocketTransport.Tid).toConstantValue(socket);
  iocContainer.bind(IAgentsStore.Tid).toConstantValue(store);
});

afterEach(() => {
  iocContainer.unbind(ISocketTransport.Tid);
  iocContainer.unbind(IAgentsStore.Tid);
  vi.clearAllMocks();
});

const subscribed = () =>
  socket.emitted.filter(e => e.event === "room:subscribe").map(e => e.args[0]);

describe("useAgentReleaseWatch", () => {
  it("с правом: список и сборки загружаются, комната agents", () => {
    renderHook(() => useAgentReleaseWatch(true));

    expect(api.getAgents).toHaveBeenCalled();
    expect(api.getAgentRelease).toHaveBeenCalledTimes(1);
    expect(subscribed()).toEqual([{ type: "agents", id: "all" }]);
  });

  it("новая версия за сессию — onUpdateAvailable; известные при открытии — нет", async () => {
    const onUpdateAvailable = vi.fn();

    renderHook(() => useAgentReleaseWatch(true, { onUpdateAvailable }));
    await waitFor(() => expect(store.candidates).toHaveLength(1));
    expect(onUpdateAvailable).not.toHaveBeenCalled();

    act(() =>
      socket.fire(
        "agent:updated",
        makeAgent({ id: "a-2", name: "b", updateAvailable: "1.3.0" }),
      ),
    );

    expect(onUpdateAvailable).toHaveBeenCalledTimes(1);
    expect(onUpdateAvailable.mock.calls[0][0]).toMatchObject({
      agentId: "a-2",
      target: "1.3.0",
    });
  });

  it("без права: ни запросов, ни комнаты", () => {
    renderHook(() => useAgentReleaseWatch(false));

    expect(api.getAgentRelease).not.toHaveBeenCalled();
    expect(api.getAgents).not.toHaveBeenCalled();
    expect(subscribed()).toEqual([]);
  });
});
