import { IMainApi } from "@shared/api";
import type {
  AgentCommandDto,
  AgentDto,
  IAgentReleaseDto,
} from "@shared/api/gen/main/model";
import { CollectionHolder, EntityHolder } from "@shared/lib/holders";
import { injectable } from "inversify";
import { makeAutoObservable, observable } from "mobx";

import { agentVersion, onlineAgentFirst, workerOf } from "../lib/agent";
import { IAgentAlert, IAgentsStore, IAgentUpdateCandidate } from "./types";

/** Агентов немного — одним списком (больше сервер не отдаёт за раз). */
const AGENTS_LIMIT = 100;

const agentCandidate = (agent: AgentDto): IAgentUpdateCandidate | null =>
  agent.updateAvailable
    ? {
        agentId: agent.id,
        current: agentVersion(agent) ?? undefined,
        target: agent.updateAvailable,
      }
    : null;

const workerCandidates = (agent: AgentDto): IAgentUpdateCandidate[] =>
  agent.workers.flatMap(worker =>
    worker.updateAvailable
      ? [
          {
            agentId: agent.id,
            worker: worker.name,
            current: worker.version,
            target: worker.updateAvailable,
          },
        ]
      : [],
  );

@injectable()
export class AgentsStore implements IAgentsStore {
  private _list = new CollectionHolder<AgentDto>({
    onFetch: async () => {
      const { data, error } = await this._api.getAgents({
        limit: AGENTS_LIMIT,
      });

      return { data: data?.items ?? null, error };
    },
    keyExtractor: agent => agent.id,
  });

  private _release = new EntityHolder<IAgentReleaseDto>({
    onFetch: () => this._api.getAgentRelease(),
  });

  private _commands = observable.map<string, AgentCommandDto>();

  constructor(@IMainApi() private _api: IMainApi) {
    makeAutoObservable(this, {}, { autoBind: true });
  }

  get agents() {
    return [...this._list.items].sort(onlineAgentFirst);
  }

  get isLoading() {
    return this._list.isLoading;
  }

  get error() {
    return this._list.error;
  }

  get alerts(): IAgentAlert[] {
    return this.agents.flatMap(agent =>
      agent.alerts.map(alert => ({
        ...alert,
        agentId: agent.id,
        agentName: agent.name,
      })),
    );
  }

  get release() {
    return this._release.data;
  }

  get candidates(): IAgentUpdateCandidate[] {
    return this.agents
      .filter(agent => !agent.revoked)
      .flatMap(agent => {
        const own = agentCandidate(agent);

        return [...(own ? [own] : []), ...workerCandidates(agent)];
      });
  }

  async load() {
    if (this._list.isSuccess) {
      await this._list.refresh();
    } else {
      await this._list.load();
    }
  }

  async loadRelease() {
    if (this._release.isFilled) {
      await this._release.refresh();
    } else {
      await this._release.load();
    }
  }

  async fetch(id: string) {
    const { data, error } = await this._api.getAgent(id);

    if (data) this.upsert(data);

    return { error: error ?? null };
  }

  byId(id: string) {
    return this._list.get(id);
  }

  alertsOf(agentId: string) {
    return this.alerts.filter(alert => alert.agentId === agentId);
  }

  updateCandidate(agentId: string) {
    const agent = this.byId(agentId);

    return agent ? agentCandidate(agent) : null;
  }

  workerCandidate(agentId: string, worker: string) {
    const agent = this.byId(agentId);
    const current = agent ? workerOf(agent, worker) : undefined;

    if (!agent || !current?.updateAvailable) return null;

    return {
      agentId,
      worker,
      current: current.version,
      target: current.updateAvailable,
    };
  }

  upsert(agent: AgentDto) {
    this._list.upsertItem(agent.id, agent);
  }

  remove(id: string) {
    this._list.removeItem(id);
  }

  trackCommand(command: AgentCommandDto) {
    if (command.status !== "done") this._commands.set(command.id, command);
  }

  settleCommand(id: string) {
    this._commands.delete(id);
  }

  pendingCommand(agentId: string, type: string, worker?: string) {
    for (const command of this._commands.values()) {
      if (
        command.agentId === agentId &&
        command.type === type &&
        (worker === undefined || command.worker === worker)
      ) {
        return command;
      }
    }

    return undefined;
  }

  reset() {
    this._commands.clear();
    this._list.reset();
    this._release.reset();
  }
}
