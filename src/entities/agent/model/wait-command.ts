import type { IMainApi } from "@shared/api";
import type { AgentCommandDto } from "@shared/api/gen/main/model";

/** Сколько сервер держит запрос итога, с: меньше таймаута HTTP-клиента. */
const WAIT_SECONDS = 25;
const REQUEST_TIMEOUT_MS = (WAIT_SECONDS + 10) * 1000;
const RETRY_PAUSE_MS = 2_000;

const pause = (ms: number, signal?: AbortSignal) =>
  new Promise<void>(resolve => {
    const timer = setTimeout(resolve, ms);

    signal?.addEventListener("abort", () => {
      clearTimeout(timer);
      resolve();
    });
  });

/**
 * Итог команды агенту: длинные запросы `GET …/commands/{id}?waitSeconds=`,
 * пока команда не завершится (сбой связи — повтор). Отмена — `signal`;
 * тогда — последнее известное состояние.
 */
export const waitAgentCommand = async (
  api: Pick<IMainApi, "getAgentCommand">,
  command: AgentCommandDto,
  signal?: AbortSignal,
): Promise<AgentCommandDto> => {
  let current = command;

  while (current.status !== "done" && !signal?.aborted) {
    const { data, error } = await api.getAgentCommand(
      command.agentId,
      command.id,
      { waitSeconds: WAIT_SECONDS },
      { timeout: REQUEST_TIMEOUT_MS, signal },
    );

    if (data) current = data;
    else if (error) await pause(RETRY_PAUSE_MS, signal);
  }

  return current;
};
