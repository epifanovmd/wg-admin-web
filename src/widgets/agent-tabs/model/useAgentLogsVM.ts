import { formatLogEntry, useAgentLog } from "@entities/agent";
import { IMainApi } from "@shared/api";
import { useEntity } from "@shared/lib/holders";
import { useState } from "react";

/** Строк журнала по умолчанию за запрос. */
const DEFAULT_LOG_LINES = 300;

/** Журнал самого агента, а не воркера. */
export const AGENT_LOG_SOURCE = "agent";

/**
 * Журнал агента: живые записи из комнаты агента и, по запросу, последние
 * записи журнала агента или воркера с узла.
 */
export const useAgentLogsVM = (agentId: string) => {
  const api = IMainApi.useInstance();
  const live = useAgentLog(agentId);
  const [lines, setLines] = useState<number | null>(DEFAULT_LOG_LINES);
  const [source, setSource] = useState<string>(AGENT_LOG_SOURCE);

  const tail = useEntity<string, { worker?: string; lines: number }>({
    queryFn: async query => {
      const res = await api.getAgentLogs(agentId, query);

      return res.error
        ? { error: res.error }
        : {
            data:
              res.data.entries.map(formatLogEntry).join("\n") || "Журнал пуст",
          };
    },
  });

  /** Ответ ждёт агента: пока идёт запрос, повторный не нужен. */
  const loadTail = () => {
    if (tail.isBusy) return;

    const query = {
      lines: lines ?? DEFAULT_LOG_LINES,
      ...(source !== AGENT_LOG_SOURCE && { worker: source }),
    };

    void (tail.data === null ? tail.load(query) : tail.refresh(query));
  };

  return {
    live,
    lines,
    setLines,
    source,
    setSource,
    tail: tail.data,
    isTailLoading: tail.isBusy,
    tailError: tail.error?.message ?? null,
    loadTail,
  };
};

export type AgentLogsVM = ReturnType<typeof useAgentLogsVM>;
