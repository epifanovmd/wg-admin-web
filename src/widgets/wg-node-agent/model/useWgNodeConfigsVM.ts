import { configuredWorkers } from "@entities/agent";
import { IMainApi } from "@shared/api";
import type {
  AgentConfigStatusDto,
  AgentDto,
  IAgentConfigEntryDto,
  IAgentManifestConfigDto,
} from "@shared/api/gen/main/model";
import { useCollection } from "@shared/lib/holders";
import { useSocketEvent, useSocketRoom } from "@shared/lib/socket";

/** Ключ настроек воркера: объявление в манифесте и статус применения. */
export interface IWorkerConfigItem {
  key: string;
  /** Ключа нет в манифесте воркера — `null`. */
  manifest: IAgentManifestConfigDto | null;
  /** Значение на сервере ещё не задано — `null`. */
  entry: IAgentConfigEntryDto | null;
}

/** Ключи настроек одного воркера. */
export interface IWorkerConfigGroup {
  worker: string;
  /** Воркер не прислал манифест: ключи неизвестны. */
  noManifest: boolean;
  items: IWorkerConfigItem[];
}

/** Статус события `agent:config`: агент удалил ключ. */
const CONFIG_DELETED = "deleted";

const entryKey = (entry: { worker: string; key: string }) =>
  `${entry.worker}/${entry.key}`;

/**
 * Настройки воркеров агента ноды (их пишет сервер из данных ноды): ключи из
 * манифестов с версиями и статусом применения, итог применения воркера.
 * Статус обновляется событием `agent:config`. Значения не показываются: в них
 * ключи WireGuard.
 */
export const useWgNodeConfigsVM = (agent: AgentDto) => {
  const api = IMainApi.useInstance();
  const entries = useCollection<IAgentConfigEntryDto, string>({
    queryFn: id => api.getAgentConfigs(id),
    keyExtractor: entryKey,
    watch: [agent.id],
  });

  useSocketRoom("agent", agent.id, () => void entries.refresh(agent.id));
  useSocketEvent<[AgentConfigStatusDto]>("agent:config", status => {
    if (status.agentId !== agent.id) return;
    if (status.state === CONFIG_DELETED) {
      entries.removeItem(entryKey(status));

      return;
    }

    const current = entries.items.find(
      entry => entryKey(entry) === entryKey(status),
    );

    if (current) entries.upsertItem(entryKey(status), { ...current, status });
    else void entries.refresh(agent.id);
  });

  const entryOf = (worker: string, key: string) =>
    entries.items.find(entry => entry.worker === worker && entry.key === key) ??
    null;

  const groups: IWorkerConfigGroup[] = configuredWorkers(agent).map(worker => {
    const declared = worker.manifest?.configs ?? [];
    const declaredKeys = new Set(declared.map(config => config.key));
    const extra = entries.items.filter(
      entry => entry.worker === worker.name && !declaredKeys.has(entry.key),
    );

    return {
      worker: worker.name,
      noManifest: !worker.manifest,
      items: [
        ...declared.map(config => ({
          key: config.key,
          manifest: config,
          entry: entryOf(worker.name, config.key),
        })),
        ...extra.map(entry => ({ key: entry.key, manifest: null, entry })),
      ],
    };
  });

  return {
    groups,
    isLoading: entries.isLoading,
    error: entries.error,
  };
};

export type WgNodeConfigsVM = ReturnType<typeof useWgNodeConfigsVM>;
