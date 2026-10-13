import {
  formatClock,
  formatJson,
  formatJsonInline,
  formatMoment,
} from "@entities/agent";
import type { IAgentEventDto } from "@shared/api/gen/main/model";
import { Badge, Collapse, Tooltip } from "@shared/ui";
import { Link } from "@tanstack/react-router";
import { FC } from "react";

interface AgentEventItemProps {
  event: IAgentEventDto;
}

/** Задача, к которой относится событие (`data.jobId`). */
const jobIdOf = (data: unknown): string | null =>
  !!data &&
  typeof data === "object" &&
  "jobId" in data &&
  typeof data.jobId === "string"
    ? data.jobId
    : null;

/**
 * Событие воркера: время, воркер, тип, данные (целиком — по раскрытию);
 * `data` не по схеме манифеста — пометка и замечания сервера.
 */
export const AgentEventItem: FC<AgentEventItemProps> = ({ event }) => {
  const jobId = jobIdOf(event.data);

  return (
    <li className="flex flex-col gap-1 py-2 text-sm first:pt-0 last:pb-0">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <Tooltip
          content={`На узле: ${formatMoment(event.at)} · принято: ${formatMoment(event.receivedAt)}`}
        >
          <span className="font-mono text-xs text-muted-foreground">
            {formatClock(event.at)}
          </span>
        </Tooltip>
        <Badge variant="secondary">{event.worker}</Badge>
        <span className="font-medium">{event.type}</span>
        {event.problems && event.problems.length > 0 && (
          <Tooltip content={event.problems.join("\n")}>
            <Badge variant="warning">data не по схеме</Badge>
          </Tooltip>
        )}
        {jobId && (
          <Link to="/jobs" className="text-xs text-primary hover:underline">
            задача {jobId.slice(0, 8)}
          </Link>
        )}
        {event.data !== undefined && (
          <code className="min-w-0 flex-1 truncate text-xs text-muted-foreground">
            {formatJsonInline(event.data)}
          </code>
        )}
      </div>
      {event.problems && event.problems.length > 0 && (
        <ul className="text-xs text-warning">
          {event.problems.map(problem => (
            <li key={problem}>{problem}</li>
          ))}
        </ul>
      )}
      {event.data !== undefined && (
        <Collapse size="sm">
          <Collapse.Trigger>Данные</Collapse.Trigger>
          <Collapse.Content>
            <pre className="max-h-48 overflow-auto rounded bg-muted p-2 text-xs">
              {formatJson(event.data)}
            </pre>
          </Collapse.Content>
        </Collapse>
      )}
    </li>
  );
};
