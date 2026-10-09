import {
  WorkerHealthBadge,
  WorkerPendingBadge,
  WorkerStateBadge,
} from "@entities/agent";
import type { IAgentWorkerDto } from "@shared/api/gen/main/model";
import {
  Badge,
  createColumnHelper,
  IconButton,
  TableRowActions,
  Tooltip,
} from "@shared/ui";
import { ArrowUpCircle, RotateCw, Zap } from "lucide-react";
import type { RefObject } from "react";

import type { WgNodeWorkersVM } from "../model/useWgNodeWorkersVM";

const column = createColumnHelper<IAgentWorkerDto>();

interface WorkerColumnsOptions {
  /** VM — через ref: колонки стабильны, ячейки не перемонтируются. */
  vm: RefObject<WgNodeWorkersVM>;
}

const MUTED_CLASS = "text-xs text-muted-foreground";

/** Колонки таблицы воркеров агента ноды. */
export const createWorkerColumns = ({ vm }: WorkerColumnsOptions) => [
  column.display({
    id: "name",
    header: "Воркер",
    cell: ({ row: { original: worker } }) => (
      <div className="min-w-0">
        <p className="flex min-w-0 items-center gap-1.5">
          <span className="truncate font-medium">{worker.name}</span>
          {worker.builtin && (
            <Tooltip content="Часть агента: собирает метрики узла">
              <Badge variant="muted">встроенный</Badge>
            </Tooltip>
          )}
        </p>
        <p className={MUTED_CLASS}>
          {[
            worker.manifest?.version ?? worker.version ?? "версия не сообщена",
            worker.release && "из выпуска",
            !!worker.restarts && `перезапусков: ${worker.restarts}`,
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
    cell: ({ row: { original: worker } }) => {
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
            {worker.pending && <WorkerPendingBadge pending={worker.pending} />}
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
    size: 240,
    cell: ({ row: { original: worker } }) => {
      if (!vm.current.agent.online) {
        return <span className={MUTED_CLASS}>—</span>;
      }
      if (!worker.health)
        return <span className={MUTED_CLASS}>нет ответа</span>;

      return (
        <div className="flex min-w-0 flex-col items-start gap-1">
          <WorkerHealthBadge worker={worker} />
          {worker.health.message && (
            <span className="line-clamp-2 text-xs text-muted-foreground">
              {worker.health.message}
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
    cell: ({ row: { original: worker } }) => {
      const { actions, accessOf, updateTargetOf } = vm.current;
      const access = accessOf(worker);
      const { updateTo } = access;

      return (
        <TableRowActions>
          {updateTo && (
            <Tooltip content={`Обновить до ${updateTo}`}>
              <IconButton
                aria-label={`Обновить воркер ${worker.name}`}
                loading={actions.isBusy("update", worker.name)}
                disabled={!!worker.pending}
                onClick={() => void actions.update(worker, updateTo)}
              >
                <ArrowUpCircle size={15} />
              </IconButton>
            </Tooltip>
          )}
          {access.canRestart && (
            <Tooltip content="Перезапустить">
              <IconButton
                aria-label={`Перезапустить воркер ${worker.name}`}
                loading={actions.isBusy("restart", worker.name)}
                disabled={!!worker.pending}
                onClick={() => void actions.restart(worker)}
              >
                <RotateCw size={15} />
              </IconButton>
            </Tooltip>
          )}
          {access.canReplaceNow && (
            <Tooltip content="Заменить сейчас, не дожидаясь окончания работы">
              <IconButton
                aria-label={`Заменить воркер ${worker.name} сейчас`}
                variant="destructive"
                onClick={() =>
                  void actions.replaceNow(worker, updateTargetOf(worker))
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
