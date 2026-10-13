import {
  WorkerHealthBadge,
  WorkerPendingBadge,
  WorkerStateBadge,
} from "@entities/agent";
import {
  Badge,
  createColumnHelper,
  IconButton,
  TableRowActions,
  Tooltip,
} from "@shared/ui";
import { ArrowUpCircle, RotateCw, Zap } from "lucide-react";
import type { RefObject } from "react";

import type { AgentWorkersVM, IWorkerRow } from "../model/useAgentWorkersVM";

const column = createColumnHelper<IWorkerRow>();

interface WorkerColumnsOptions {
  /** VM — через ref: колонки стабильны, ячейки не перемонтируются. */
  vm: RefObject<AgentWorkersVM>;
}

const MUTED_CLASS = "text-xs text-muted-foreground";

/** Колонки таблицы воркеров агента. */
export const createWorkerColumns = ({ vm }: WorkerColumnsOptions) => [
  column.display({
    id: "name",
    header: "Воркер",
    cell: ({ row: { original } }) => (
      <div className="min-w-0">
        <p className="flex min-w-0 items-center gap-1.5">
          <span className="truncate font-medium">{original.worker.name}</span>
        </p>
        <p className={MUTED_CLASS}>
          {[
            original.worker.version ?? "версия не сообщена",
            original.worker.release && "сборка с сервера",
            !!original.worker.restarts &&
              `перезапусков: ${original.worker.restarts}`,
          ]
            .filter(Boolean)
            .join(" · ")}
        </p>
      </div>
    ),
  }),
  column.display({
    id: "state",
    header: "Состояние",
    size: 220,
    cell: ({ row: { original } }) => {
      const { worker, pending } = original;

      // Без связи состояние устарело — не выдаём его за текущее.
      if (!vm.current.agent.online) {
        return (
          <Tooltip
            content={`Последнее известное: ${worker.state ?? "не сообщалось"}`}
          >
            <Badge variant="muted">неизвестно</Badge>
          </Tooltip>
        );
      }

      return (
        <div className="flex min-w-0 flex-col items-start gap-1">
          <div className="flex flex-wrap items-center gap-1">
            {worker.state && (
              <WorkerStateBadge state={worker.state} message={worker.message} />
            )}
            {pending && <WorkerPendingBadge pending={pending} />}
          </div>
          {worker.state === "invalid" && worker.message && (
            <span className="line-clamp-2 text-xs text-destructive">
              {worker.message}
            </span>
          )}
        </div>
      );
    },
  }),
  column.display({
    id: "health",
    header: "Самочувствие",
    size: 220,
    cell: ({ row: { original } }) => {
      const { health } = original.worker;

      if (!vm.current.agent.online) {
        return <span className={MUTED_CLASS}>—</span>;
      }
      if (!health) return <span className={MUTED_CLASS}>нет ответа</span>;

      return (
        <div className="flex min-w-0 flex-col items-start gap-1">
          <WorkerHealthBadge worker={original.worker} />
          {health.message && (
            <span className="line-clamp-2 text-xs text-muted-foreground">
              {health.message}
            </span>
          )}
        </div>
      );
    },
  }),
  column.display({
    id: "actions",
    size: 150,
    meta: { align: "right" },
    cell: ({ row: { original } }) => {
      const { worker, pending } = original;
      const { agent, actions, accessOf } = vm.current;
      const access = accessOf(worker);
      const { updateTo } = access;

      return (
        <TableRowActions>
          {updateTo && (
            <Tooltip content={`Обновить до ${updateTo}`}>
              <IconButton
                aria-label="Обновить воркер"
                loading={actions.isBusy("update", worker.name)}
                disabled={!!pending}
                onClick={() => void actions.update(agent, worker, updateTo)}
              >
                <ArrowUpCircle size={15} />
              </IconButton>
            </Tooltip>
          )}
          {access.canRestart && (
            <Tooltip content="Перезапустить">
              <IconButton
                aria-label="Перезапустить"
                loading={actions.isBusy("restart", worker.name)}
                disabled={!!pending}
                onClick={() => void actions.restart(agent, worker)}
              >
                <RotateCw size={15} />
              </IconButton>
            </Tooltip>
          )}
          {access.canReplaceNow && (
            <Tooltip content="Заменить сейчас, не дожидаясь окончания работы">
              <IconButton
                aria-label="Заменить сейчас"
                variant="destructive"
                onClick={() =>
                  void actions.replaceNow(
                    agent,
                    worker,
                    vm.current.updateTargetOf(worker),
                  )
                }
              >
                <Zap size={15} />
              </IconButton>
            </Tooltip>
          )}
        </TableRowActions>
      );
    },
  }),
];
