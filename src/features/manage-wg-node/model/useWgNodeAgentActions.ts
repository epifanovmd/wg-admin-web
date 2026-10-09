import { IMainApi } from "@shared/api";
import type {
  IAgentWorkerActionResultDto,
  IAgentWorkerDto,
} from "@shared/api/gen/main/model";
import type { IHolderError } from "@shared/lib/holders";
import { notifyApiError } from "@shared/lib/http";
import { INotificationService } from "@shared/lib/notifications";
import { useConfirm } from "@shared/ui";
import { useState } from "react";

type TAgentAction = "agent" | "restart" | "update";

interface UseWgNodeAgentActionsOptions {
  nodeId: string;
  /** Действие выполнено или отложено: карточку агента стоит перечитать. */
  onChanged?: () => void;
}

const isBusyWorker = (worker: IAgentWorkerDto): boolean =>
  !!worker.health?.busy;

/**
 * Действия с агентом ноды: обновление агента до выпуска, перезапуск и
 * обновление воркеров. Свободный воркер заменяется сразу; занятый — после
 * окончания работы: ответ приходит сразу (`deferred`), ожидание видно в
 * статусе воркера, итог — событием `agent:action` (`useWorkerActionResults`).
 * «Заменить сейчас» (`force`) — сразу, прерывая работу.
 */
export const useWgNodeAgentActions = ({
  nodeId,
  onChanged,
}: UseWgNodeAgentActionsOptions) => {
  const api = IMainApi.useInstance();
  const toast = INotificationService.useInstance();
  const confirm = useConfirm();
  const [busy, setBusy] = useState<string[]>([]);

  const run = async <T>(
    key: string,
    request: () => Promise<{ data?: T; error?: IHolderError | null }>,
  ): Promise<T | null> => {
    setBusy(prev => [...prev, key]);

    const res = await request();

    setBusy(prev => prev.filter(item => item !== key));
    if (res.error || res.data === undefined) {
      notifyApiError(toast, res.error);

      return null;
    }
    onChanged?.();

    return res.data;
  };

  /** Ответ на замену воркера: отложенная — сообщение об ожидании. */
  const replaced = (
    worker: IAgentWorkerDto,
    res: IAgentWorkerActionResultDto | null,
  ): IAgentWorkerActionResultDto | null => {
    if (!res) return null;
    if (res.deferred) {
      toast.info(
        `Воркер «${worker.name}» занят — агент заменит его, когда освободится`,
      );

      return null;
    }

    return res;
  };

  const updateAgent = async (current: string | null, target: string) => {
    const ok = await confirm({
      title: `Обновить агента до версии ${target}?`,
      description: [
        current && `Сейчас — ${current}.`,
        "Агент скачает сборку из выпуска и перезапустится; воркеры продолжат работу.",
      ]
        .filter(Boolean)
        .join(" "),
      confirmLabel: "Обновить",
    });

    if (!ok) return;

    const res = await run("agent", () => api.updateWgNodeAgent(nodeId));

    if (res) toast.success(`Агент работает на версии ${res.version}`);
  };

  const restart = async (worker: IAgentWorkerDto, force = false) => {
    const ok = await confirm({
      title: force
        ? `Перезапустить воркер «${worker.name}» сейчас?`
        : `Перезапустить воркер «${worker.name}»?`,
      description: [
        force
          ? "Агент остановит воркер, не дожидаясь окончания работы, и запустит заново."
          : isBusyWorker(worker)
            ? "Воркер занят: агент перезапустит его, когда работа закончится."
            : "Агент остановит воркер и запустит заново.",
        "Интерфейсы, туннели и пробросы на ноде при этом не разбираются.",
      ].join(" "),
      confirmLabel: "Перезапустить",
      confirmVariant: force ? "destructive" : undefined,
    });

    if (!ok) return;

    const res = replaced(
      worker,
      await run(`restart:${worker.name}`, () =>
        api.restartWgNodeWorker(nodeId, worker.name, { force }),
      ),
    );

    if (res) toast.success(`Воркер «${worker.name}» перезапущен`);
  };

  const update = async (
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
        "Агент скачает сборку из выпуска и заменит воркер; не заработает — вернёт прежнюю.",
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

    const res = replaced(
      worker,
      await run(`update:${worker.name}`, () =>
        api.updateWgNodeWorker(nodeId, worker.name, { force }),
      ),
    );

    if (res) {
      toast.success(
        res.version
          ? `Воркер «${worker.name}» работает на версии ${res.version}`
          : `Воркер «${worker.name}» обновлён`,
      );
    }
  };

  /** Заменить сейчас: отложенное обновление или перезапуск — без ожидания. */
  const replaceNow = (worker: IAgentWorkerDto, target: string | null) =>
    worker.pending === "update"
      ? update(worker, target, true)
      : restart(worker, true);

  return {
    updateAgent,
    restart,
    update,
    replaceNow,
    /** Идёт ли действие: `agent` или `restart`/`update` с именем воркера. */
    isBusy: (action: TAgentAction, worker?: string) =>
      busy.includes(worker ? `${action}:${worker}` : action),
  };
};

export type WgNodeAgentActions = ReturnType<typeof useWgNodeAgentActions>;
