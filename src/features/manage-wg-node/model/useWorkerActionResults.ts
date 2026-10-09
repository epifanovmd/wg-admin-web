import type { IAgentActionEvent } from "@entities/agent";
import { INotificationService } from "@shared/lib/notifications";
import { useSocketEvent } from "@shared/lib/socket";

const WORKER_ACTIONS: Record<string, { done: string; failed: string }> = {
  "worker.restart": { done: "перезапущен", failed: "не перезапущен" },
  "worker.update": { done: "обновлён", failed: "не обновлён" },
};

/** Имя воркера в аргументах действия (`args.name`). */
const workerOfEvent = (event: IAgentActionEvent): string =>
  typeof event.args?.name === "string" ? event.args.name : "?";

const versionOf = (result: unknown): string | null =>
  typeof result === "object" &&
  result !== null &&
  "version" in result &&
  typeof result.version === "string"
    ? result.version
    : null;

/**
 * Итоги отложенных замен воркеров агента (`agent:action` с `deferred`): тост
 * и `onSettled` — перечитать агента. Сокет должен быть в комнате агента — её
 * держит страница.
 */
export const useWorkerActionResults = (
  agentId: string | null,
  onSettled?: () => void,
): void => {
  const toast = INotificationService.useInstance();

  useSocketEvent<[IAgentActionEvent]>(
    "agent:action",
    event => {
      const texts = WORKER_ACTIONS[event.name];

      if (event.agentId !== agentId || !event.deferred || !texts) return;

      const worker = workerOfEvent(event);

      if (event.status === "done") {
        const version = versionOf(event.result);

        toast.success(
          `Воркер «${worker}» ${texts.done}${version ? `: версия ${version}` : ""}`,
        );
      } else {
        toast.error(event.error?.message ?? "Агент не выполнил замену", {
          title: `Воркер «${worker}» ${texts.failed}`,
        });
      }
      onSettled?.();
    },
    !!agentId,
  );
};
