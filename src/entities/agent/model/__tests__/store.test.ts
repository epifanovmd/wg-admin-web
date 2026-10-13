import type { IMainApi } from "@shared/api";
import type { AgentCommandDto } from "@shared/api/gen/main/model";
import { describe, expect, it, vi } from "vitest";

import { makeAgent, makeWorker } from "../../lib/__tests__/agent-fixture";
import { AgentsStore } from "../store";

const createStore = (api: Partial<IMainApi>) =>
  new AgentsStore(api as unknown as IMainApi);

const command = (patch: Partial<AgentCommandDto> = {}): AgentCommandDto => ({
  id: "c-1",
  agentId: "a-1",
  type: "worker.restart",
  worker: "echo",
  status: "pending",
  createdAt: 1,
  ...patch,
});

describe("AgentsStore", () => {
  it("список: на связи — первыми", async () => {
    const store = createStore({
      getAgents: vi.fn().mockResolvedValue({
        data: {
          items: [
            makeAgent({ id: "b", name: "b", online: false }),
            makeAgent({ id: "a", name: "z" }),
          ],
          total: 2,
        },
      }),
    } as Partial<IMainApi>);

    await store.load();

    expect(store.agents.map(a => a.id)).toEqual(["a", "b"]);
  });

  it("агент по id попадает в список", async () => {
    const getAgent = vi.fn().mockResolvedValue({ data: makeAgent() });
    const store = createStore({ getAgent } as Partial<IMainApi>);

    expect((await store.fetch("a-1")).error).toBeNull();
    expect(store.byId("a-1")?.name).toBe("node-01");
  });

  it("проблемы — из агентов, с агентом; удаление агента убирает их", () => {
    const store = createStore({});

    store.upsert(
      makeAgent({
        alerts: [{ kind: "workerDown", worker: "echo", message: "упал" }],
      }),
    );
    store.upsert(makeAgent({ id: "a-2", name: "node-02" }));

    expect(store.alerts).toEqual([
      {
        kind: "workerDown",
        worker: "echo",
        message: "упал",
        agentId: "a-1",
        agentName: "node-01",
      },
    ]);
    expect(store.alertsOf("a-2")).toEqual([]);

    store.remove("a-1");
    expect(store.alerts).toEqual([]);
  });

  it("новые версии агента и воркеров — из агентов; отозванный — без них", () => {
    const store = createStore({});

    store.upsert(
      makeAgent({
        updateAvailable: "1.2.0",
        workers: [makeWorker({ updateAvailable: "1.1.0", release: true })],
      }),
    );
    store.upsert(
      makeAgent({ id: "a-2", revoked: true, updateAvailable: "1.2.0" }),
    );

    expect(store.updateCandidate("a-1")).toEqual({
      agentId: "a-1",
      current: "1.0.0",
      target: "1.2.0",
    });
    expect(store.workerCandidate("a-1", "echo")?.target).toBe("1.1.0");
    expect(store.candidates).toHaveLength(2);

    store.upsert(makeAgent({ version: "1.2.0" }));
    expect(store.updateCandidate("a-1")).toBeNull();
    expect(store.workerCandidate("a-1", "echo")).toBeNull();
  });

  it("ждущие команды: учёт до итога, поиск по типу и воркеру", () => {
    const store = createStore({});

    store.trackCommand(command());
    store.trackCommand(command({ id: "c-2", status: "done" }));

    expect(store.pendingCommand("a-1", "worker.restart", "echo")?.id).toBe(
      "c-1",
    );
    expect(store.pendingCommand("a-1", "worker.restart", "kv")).toBeUndefined();
    expect(store.pendingCommand("a-1", "worker.update")).toBeUndefined();

    store.settleCommand("c-1");
    expect(store.pendingCommand("a-1", "worker.restart")).toBeUndefined();
  });

  it("сброс при выходе очищает всё", async () => {
    const store = createStore({
      getAgentRelease: vi
        .fn()
        .mockResolvedValue({ data: { bundle: true, workers: [] } }),
    } as Partial<IMainApi>);

    store.upsert(makeAgent());
    store.trackCommand(command());
    await store.loadRelease();
    store.reset();

    expect(store.agents).toEqual([]);
    expect(store.release).toBeNull();
    expect(store.pendingCommand("a-1", "worker.restart")).toBeUndefined();
  });
});
