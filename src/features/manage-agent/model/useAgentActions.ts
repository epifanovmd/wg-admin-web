import { agentVersion, IAgentsStore } from "@entities/agent";
import { IMainApi } from "@shared/api";
import type { AgentDto } from "@shared/api/gen/main/model";
import { notifyApiError } from "@shared/lib/http";
import { INotificationService } from "@shared/lib/notifications";
import { useConfirm } from "@shared/ui";
import { useState } from "react";

import { useAgentCommand } from "./useAgentCommand";

type TAgentAction = "revoke" | "remove" | "rotate" | "update";

const versionOf = (result: unknown): string | null =>
  typeof result === "object" &&
  result !== null &&
  "version" in result &&
  typeof result.version === "string"
    ? result.version
    : null;

interface UseAgentActionsOptions {
  /** Агент удалён (например, уйти со страницы агента). */
  onDeleted?: (agent: AgentDto) => void;
}

/**
 * Действия с агентом: отзыв, удаление, смена ключа и обновление — с
 * подтверждением. Смена ключа и обновление — команды агенту: ждут его итога.
 */
export const useAgentActions = ({ onDeleted }: UseAgentActionsOptions = {}) => {
  const api = IMainApi.useInstance();
  const toast = INotificationService.useInstance();
  const store = IAgentsStore.useInstance();
  const confirm = useConfirm();
  const [busy, setBusy] = useState<string[]>([]);
  const command = useAgentCommand();

  const run = async <T>(
    action: TAgentAction,
    agent: AgentDto,
    request: () => Promise<{ data?: T | null; error?: unknown }>,
  ): Promise<{ ok: boolean; data: T | null }> => {
    const key = `${action}:${agent.id}`;

    setBusy(prev => [...prev, key]);

    const res = await request();

    setBusy(prev => prev.filter(item => item !== key));
    if (res.error) {
      notifyApiError(toast, res.error);

      return { ok: false, data: null };
    }

    return { ok: true, data: res.data ?? null };
  };

  const revoke = async (agent: AgentDto) => {
    const ok = await confirm({
      title: `Отозвать агента «${agent.name}»?`,
      description:
        "Агент остановит воркеры, уберёт за ними и больше не выйдет на связь; запись с историей останется в списке. Вернуть агента — новая установка с токеном.",
      confirmLabel: "Отозвать",
      confirmVariant: "destructive",
    });

    if (!ok) return;

    const res = await run("revoke", agent, () => api.revokeAgent(agent.id));

    if (res.data) store.upsert(res.data);
    if (res.ok) toast.success(`Агент «${agent.name}» отозван`);
  };

  const remove = async (agent: AgentDto) => {
    const ok = await confirm({
      title: `Удалить агента «${agent.name}»?`,
      description:
        "Агент пропадёт из списка вместе с настройками воркеров, событиями и историей метрик. На машине он остановит воркеры, уберёт за ними и больше не выйдет на связь; программа останется до удаления на узле (agent uninstall --purge или по SSH).",
      confirmLabel: "Удалить",
      confirmVariant: "destructive",
    });

    if (!ok) return;

    const res = await run("remove", agent, () => api.deleteAgent(agent.id));

    if (!res.ok) return;
    store.remove(agent.id);
    toast.success(`Агент «${agent.name}» удалён`);
    onDeleted?.(agent);
  };

  const rotateKey = async (agent: AgentDto) => {
    const ok = await confirm({
      title: `Сменить ключ агента «${agent.name}»?`,
      description:
        "Агент создаст новый секрет и переподключится с ним. Переустанавливать агента не нужно, воркеры не перезапускаются.",
      confirmLabel: "Сменить ключ",
    });

    if (!ok) return;

    const done = await command.run(`rotate:${agent.id}`, () =>
      api.rotateAgentKey(agent.id),
    );

    if (done?.ok) toast.success(`Ключ агента «${agent.name}» сменён`);
    else if (done) {
      toast.error(done.error?.message ?? "Агент не сменил ключ", {
        title: `Ключ агента «${agent.name}» не сменён`,
      });
    }
  };

  /** `target` — новая версия; неизвестна (нет права видеть сборки) — `null`. */
  const update = async (agent: AgentDto, target: string | null) => {
    const current = agentVersion(agent);
    const ok = await confirm({
      title: target
        ? `Обновить агента «${agent.name}» до версии ${target}?`
        : `Обновить агента «${agent.name}» до новой версии?`,
      description: `${current ? `Сейчас — ${current}. ` : ""}Агент скачает новую программу, проверит подпись и перезапустится; воркеры продолжат работу.`,
      confirmLabel: "Обновить",
    });

    if (!ok) return;

    toast.info(`Агент «${agent.name}» обновляется`);

    // Итог присылает уже новая версия после перезапуска.
    const done = await command.run(`update:${agent.id}`, () =>
      api.updateAgent(agent.id, target ? { version: target } : {}),
    );

    if (done?.ok) {
      toast.success(
        `Агент «${agent.name}» работает на версии ${versionOf(done.result) ?? target ?? "?"}`,
      );
    } else if (done) {
      toast.error(done.error?.message ?? "Агент не обновился", {
        title: `Агент «${agent.name}» не обновлён`,
      });
    }
  };

  return {
    revoke,
    remove,
    rotateKey,
    update,
    /** Идёт ли это действие с агентом. */
    isBusy: (action: TAgentAction, agentId: string) =>
      busy.includes(`${action}:${agentId}`) ||
      command.isBusy(`${action}:${agentId}`),
  };
};

export type AgentActions = ReturnType<typeof useAgentActions>;
