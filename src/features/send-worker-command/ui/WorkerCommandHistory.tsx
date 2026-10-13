import { agentErrorText, formatClock, formatJson } from "@entities/agent";
import type { AgentCommandDto } from "@shared/api/gen/main/model";
import { Badge, Button, Progress } from "@shared/ui";
import { Square } from "lucide-react";
import { FC } from "react";

import { commandArgsOf, commandStatusView } from "../lib/command-view";

interface WorkerCommandHistoryProps {
  commands: AgentCommandDto[];
  onCancel: (command: AgentCommandDto) => void;
}

const Json: FC<{ value: unknown }> = ({ value }) => (
  <pre className="max-h-64 overflow-auto rounded-md bg-muted p-2 font-mono text-xs whitespace-pre-wrap break-all">
    {formatJson(value)}
  </pre>
);

/** Отправленные команды, новые первыми: ход, итог или ошибка, отмена идущей. */
export const WorkerCommandHistory: FC<WorkerCommandHistoryProps> = ({
  commands,
  onCancel,
}) => {
  if (commands.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Итоги отправленных команд появятся здесь.
      </p>
    );
  }

  return (
    <ul className="flex flex-col divide-y divide-border">
      {commands.map(command => {
        const view = commandStatusView(command);
        const args = commandArgsOf(command);

        return (
          <li
            key={command.id}
            className="flex flex-col gap-2 py-3 first:pt-0 last:pb-0"
          >
            <p className="flex flex-wrap items-center gap-2 text-sm">
              <span className="font-mono font-medium">
                {command.worker} · {command.workerType}
              </span>
              <Badge variant={view.variant}>{view.label}</Badge>
              <span className="text-xs text-muted-foreground">
                {formatClock(command.createdAt)}
              </span>
              {command.status !== "done" && (
                <Button
                  size="sm"
                  variant="outline"
                  leftIcon={<Square size={13} />}
                  onClick={() => onCancel(command)}
                  className="ml-auto"
                >
                  Отменить
                </Button>
              )}
            </p>
            {command.status !== "done" && (
              <div className="flex flex-col gap-1">
                <Progress
                  value={command.progress ?? undefined}
                  indeterminate={!command.progress}
                />
                {command.progressText && (
                  <p className="text-xs text-muted-foreground">
                    {command.progressText}
                  </p>
                )}
              </div>
            )}
            {args !== undefined && <Json value={args} />}
            {command.status === "done" &&
              command.ok &&
              command.result !== undefined && <Json value={command.result} />}
            {command.error && (
              <p className="text-sm text-destructive">
                {agentErrorText(command.error.code)?.title ??
                  command.error.code}
                : {command.error.message}
              </p>
            )}
          </li>
        );
      })}
    </ul>
  );
};
