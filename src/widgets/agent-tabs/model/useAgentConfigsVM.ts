import { agentWorkers } from "@entities/agent";
import {
  type IWorkerConfigTarget,
  useWorkerConfigEditorVM,
} from "@features/edit-worker-config";
import { IMainApi } from "@shared/api";
import type { AgentConfigDto, AgentDto } from "@shared/api/gen/main/model";
import { useCollection } from "@shared/lib/holders";
import { useSocketEvent, useSocketRoom } from "@shared/lib/socket";

/** Ключи настроек одного воркера. */
export interface IWorkerConfigGroup {
  worker: string;
  /** Воркер не прислал манифест: ключи и схемы неизвестны. */
  noManifest: boolean;
  items: IWorkerConfigTarget[];
}

const entryKey = (entry: { worker: string; key: string }) =>
  `${entry.worker}/${entry.key}`;

/**
 * Настройки воркеров агента: ключи из манифестов воркеров вместе с заданными
 * на сервере значениями и статусом применения; статус обновляется событием
 * `agent:config`, удалённый ключ (`deleted`) пропадает. Ключ, которого нет в манифесте, тоже показывается — его
 * можно удалить.
 */
export const useAgentConfigsVM = (agent: AgentDto, canConfig: boolean) => {
  const api = IMainApi.useInstance();
  const entries = useCollection<AgentConfigDto, string>({
    queryFn: id => api.getAgentConfigs(id),
    keyExtractor: entryKey,
    watch: [agent.id],
  });

  useSocketRoom("agent", agent.id, () => void entries.refresh(agent.id));
  useSocketEvent<[AgentConfigDto]>("agent:config", config => {
    if (config.agentId !== agent.id) return;
    if (config.deleted) {
      entries.removeItem(entryKey(config));

      return;
    }

    const current = entries.items.find(
      entry => entryKey(entry) === entryKey(config),
    );

    // Значение событие не несёт: оно остаётся прежним (или перечитывается).
    if (current && current.version === config.version) {
      entries.upsertItem(entryKey(config), {
        ...current,
        ...config,
        data: current.data,
      });
    } else {
      void entries.refresh(agent.id);
    }
  });

  const editor = useWorkerConfigEditorVM({
    onSaved: entry => entries.upsertItem(entryKey(entry), entry),
    onDeleted: () => void entries.refresh(agent.id),
  });

  const entryOf = (worker: string, key: string) =>
    entries.items.find(entry => entry.worker === worker && entry.key === key) ??
    null;

  const groups: IWorkerConfigGroup[] = agentWorkers(agent).map(worker => {
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
          agentId: agent.id,
          worker: worker.name,
          key: config.key,
          manifest: config,
          entry: entryOf(worker.name, config.key),
        })),
        ...extra.map(entry => ({
          agentId: agent.id,
          worker: worker.name,
          key: entry.key,
          manifest: null,
          entry,
        })),
      ],
    };
  });

  return {
    groups,
    isLoading: entries.isLoading,
    error: entries.error,
    editor,
    canConfig,
  };
};

export type AgentConfigsVM = ReturnType<typeof useAgentConfigsVM>;
