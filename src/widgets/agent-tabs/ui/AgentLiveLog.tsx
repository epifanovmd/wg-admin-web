import { formatLogEntry, type IAgentLogEntry } from "@entities/agent";
import { FC, useEffect, useRef } from "react";

interface AgentLiveLogProps {
  entries: IAgentLogEntry[];
  emptyText: string;
}

/** Расстояние до низа, при котором журнал ещё «прилипает» к новым строкам, px. */
const STICK_DISTANCE = 40;

/** Живой журнал: новые строки внизу; прокрученный вверх — не дёргается. */
export const AgentLiveLog: FC<AgentLiveLogProps> = ({ entries, emptyText }) => {
  const ref = useRef<HTMLPreElement>(null);
  const stick = useRef(true);

  useEffect(() => {
    const element = ref.current;

    if (element && stick.current) element.scrollTop = element.scrollHeight;
  }, [entries]);

  return (
    <pre
      ref={ref}
      className="min-h-40 flex-1 overflow-auto rounded-lg bg-muted p-3 text-xs"
      onScroll={event => {
        const element = event.currentTarget;

        stick.current =
          element.scrollHeight - element.scrollTop - element.clientHeight <
          STICK_DISTANCE;
      }}
    >
      {entries.length ? entries.map(formatLogEntry).join("\n") : emptyText}
    </pre>
  );
};
