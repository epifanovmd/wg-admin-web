import { IAgentsStore } from "@entities/agent";
import { IMainApi } from "@shared/api";
import type {
  AgentCommandDto,
  AgentDto,
  IAgentWorkerDto,
} from "@shared/api/gen/main/model";
import { INotificationService } from "@shared/lib/notifications";
import { useConfirm } from "@shared/ui";

import { useAgentCommand } from "./useAgentCommand";

type TWorkerAction = "restart" | "update";

const COMMAND_TYPE: Record<TWorkerAction, string> = {
  restart: "worker.restart",
  update: "worker.update",
};

const isBusyWorker = (worker: IAgentWorkerDto): boolean =>
  !!worker.health?.busy;

const versionOf = (result: unknown): string | null =>
  typeof result === "object" &&
  result !== null &&
  "version" in result &&
  typeof result.version === "string"
    ? result.version
    : null;

/**
 * Действия с воркером агента: перезапуск и обновление сборкой с сервера —
 * команды агенту. Свободный воркер заменяется сразу; занятый — после окончания
 * работы (строка показывает ожидание, итог — тостом, когда придёт).
 * «Заменить сейчас» (`force`) — сразу, прерывая работу.
 */
export const useWorkerActions = () => {
  const api = IMainApi.useInstance();
  const store = IAgentsStore.useInstance();
  const toast = INotificationService.useInstance();
  const confirm = useConfirm();
  const command = useAgentCommand();

  const report = (
    action: TWorkerAction,
    worker: IAgentWorkerDto,
    done: AgentCommandDto | null,
  ) => {
    if (!done) return;
    if (done.ok) {
      const version = versionOf(done.result);

      toast.success(
        action === "update"
          ? `Воркер «${worker.name}» работает на версии ${version ?? "?"}`
          : `Воркер «${worker.name}» перезапущен`,
      );
    } else {
      toast.error(done.error?.message ?? "Агент не выполнил команду", {
        title: `Воркер «${worker.name}» ${action === "update" ? "не обновлён" : "не перезапущен"}`,
      });
    }
  };

  const onQueued = (worker: IAgentWorkerDto, force: boolean) => () => {
    if (!force && isBusyWorker(worker)) {
      toast.info(
        `Воркер «${worker.name}» занят — агент заменит его, когда освободится`,
      );
    }
  };

  const restart = async (
    agent: AgentDto,
    worker: IAgentWorkerDto,
    force = false,
  ) => {
    const ok = await confirm({
      title: force
        ? `Перезапустить воркер «${worker.name}» сейчас?`
        : `Перезапустить воркер «${worker.name}»?`,
      description: force
        ? "Агент остановит воркер, не дожидаясь окончания работы, и запустит заново."
        : isBusyWorker(worker)
          ? "Воркер занят: агент перезапустит его, когда работа закончится."
          : "Агент остановит воркер и запустит заново.",
      confirmLabel: "Перезапустить",
      confirmVariant: force ? "destructive" : undefined,
    });

    if (!ok) return;

    report(
      "restart",
      worker,
      await command.run(
        `restart:${worker.name}`,
        () => api.restartAgentWorker(agent.id, worker.name, { force }),
        onQueued(worker, force),
      ),
    );
  };

  const update = async (
    agent: AgentDto,
    worker: IAgentWorkerDto,
    target: string | null,
    force = false,
  ) => {
    const ok = await confirm({
      title: target
        ? `Обновить воркер «${worker.name}» до версии ${target}?`
        : `Обновить воркер «${worker.name}» сейчас?`,
      description: [
        worker.version && `Сейчас — ${worker.version}.`,
        "Агент скачает сборку с сервера и заменит воркер; не заработает — вернёт прежнюю.",
        force
          ? "Работа воркера прервётся."
          : isBusyWorker(worker) &&
            "Воркер занят: замена — когда работа закончится.",
      ]
        .filter(Boolean)
        .join(" "),
      confirmLabel: "Обновить",
      confirmVariant: force ? "destructive" : undefined,
    });

    if (!ok) return;

    report(
      "update",
      worker,
      await command.run(
        `update:${worker.name}`,
        () =>
          api.updateAgentWorker(agent.id, worker.name, {
            force,
            ...(target && { version: target }),
          }),
        onQueued(worker, force),
      ),
    );
  };

  /** Ждущая замена воркера (поставленная здесь или видная агенту). */
  const pendingOf = (
    agent: AgentDto,
    worker: IAgentWorkerDto,
  ): TWorkerAction | null => {
    if (worker.pending) return worker.pending;
    if (store.pendingCommand(agent.id, COMMAND_TYPE.update, worker.name)) {
      return "update";
    }
    if (store.pendingCommand(agent.id, COMMAND_TYPE.restart, worker.name)) {
      return "restart";
    }

    return null;
  };

  /** Заменить сейчас: отложенное обновление или перезапуск — без ожидания. */
  const replaceNow = (
    agent: AgentDto,
    worker: IAgentWorkerDto,
    target: string | null,
  ) =>
    pendingOf(agent, worker) === "update"
      ? update(agent, worker, target, true)
      : restart(agent, worker, true);

  return {
    restart,
    update,
    replaceNow,
    pendingOf,
    /** Идёт ли это действие с воркером. */
    isBusy: (action: TWorkerAction, worker: string) =>
      command.isBusy(`${action}:${worker}`),
  };
};

export type WorkerActions = ReturnType<typeof useWorkerActions>;
