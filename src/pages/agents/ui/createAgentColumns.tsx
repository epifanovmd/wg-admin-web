import {
  AgentLabels,
  AgentStatusBadge,
  agentSubtitle,
  agentVersion,
  formatMoment,
  formatPercent,
  pointHost,
  usagePercent,
  workersSummary,
} from "@entities/agent";
import type { AgentDto } from "@shared/api/gen/main/model";
import {
  Badge,
  createColumnHelper,
  IconButton,
  stopRowClick,
  TableRowActions,
  Tooltip,
} from "@shared/ui";
import { Link } from "@tanstack/react-router";
import { ArrowUpCircle, Ban, KeyRound, Trash2 } from "lucide-react";
import type { RefObject } from "react";

import type { AgentsVM } from "../model/useAgentsVM";

const column = createColumnHelper<AgentDto>();

interface AgentColumnsOptions {
  /** VM — через ref: колонки стабильны, ячейки не перемонтируются. */
  vm: RefObject<AgentsVM>;
}

const MUTED_CLASS = "text-xs text-muted-foreground";

/** Колонки таблицы агентов. */
export const createAgentColumns = ({ vm }: AgentColumnsOptions) => [
  column.display({
    id: "name",
    header: "Агент",
    size: 220,
    cell: ({ row }) => (
      <div className="min-w-0">
        <Link
          to="/agents/$agentId"
          params={{ agentId: row.original.id }}
          className="block truncate font-medium hover:underline"
          onClick={stopRowClick}
        >
          {row.original.name}
        </Link>
        <p className={`truncate ${MUTED_CLASS}`}>
          {agentSubtitle(row.original)}
        </p>
      </div>
    ),
  }),
  column.display({
    id: "labels",
    header: "Метки",
    size: 180,
    cell: ({ row }) => (
      <AgentLabels labels={row.original.labels} emptyText="—" compact />
    ),
  }),
  column.display({
    id: "status",
    header: "Статус",
    size: 190,
    cell: ({ row }) => {
      const alerts = row.original.alerts.length;

      return (
        <div className="flex flex-col items-start gap-1">
          <AgentStatusBadge agent={row.original} />
          {alerts > 0 && (
            <span className="text-xs text-destructive">проблем: {alerts}</span>
          )}
        </div>
      );
    },
  }),
  column.display({
    id: "version",
    header: "Версия",
    size: 150,
    cell: ({ row }) => {
      const target = vm.current.updateTarget(row.original);

      return (
        <p className="flex flex-wrap items-center gap-1.5 whitespace-nowrap text-sm">
          {agentVersion(row.original) ?? "—"}
          {target && (
            <Tooltip content={`Доступна версия ${target}`}>
              <Badge variant="warning" aria-label={`Доступна версия ${target}`}>
                → {target}
              </Badge>
            </Tooltip>
          )}
        </p>
      );
    },
  }),
  column.display({
    id: "workers",
    header: "Воркеры",
    size: 120,
    cell: ({ row }) => {
      const { total, troubled } = workersSummary(row.original);

      return (
        <div className="text-sm">
          <p>{total || "—"}</p>
          {/* Без связи статус воркеров устарел — неполадки по нему не показываем. */}
          {row.original.online && troubled > 0 && (
            <p className="text-xs text-warning">не в порядке: {troubled}</p>
          )}
        </div>
      );
    },
  }),
  column.display({
    id: "resources",
    header: "Нагрузка",
    size: 130,
    cell: ({ row }) => {
      const host = row.original.online
        ? pointHost(row.original.metrics)
        : undefined;

      if (!host) return <span className={MUTED_CLASS}>—</span>;

      return (
        <div className={MUTED_CLASS}>
          <p>CPU {formatPercent(host.cpuPercent)}</p>
          <p>
            память{" "}
            {formatPercent(usagePercent(host.memUsedBytes, host.memTotalBytes))}
          </p>
        </div>
      );
    },
  }),
  column.display({
    id: "lastSeen",
    header: "Связь",
    size: 140,
    cell: ({ row }) => (
      <span className={MUTED_CLASS}>
        {row.original.online
          ? "сейчас"
          : row.original.lastSeenAt
            ? formatMoment(row.original.lastSeenAt)
            : "не выходил на связь"}
      </span>
    ),
  }),
  column.display({
    id: "actions",
    size: 150,
    meta: { align: "right" },
    cell: ({ row }) => {
      const agent = row.original;
      const { actions, accessOf } = vm.current;
      const access = accessOf(agent);
      const { updateTo } = access;

      return (
        <TableRowActions>
          {updateTo && (
            <Tooltip content={`Обновить до ${updateTo}`}>
              <IconButton
                aria-label="Обновить агента"
                loading={actions.isBusy("update", agent.id)}
                onClick={() => void actions.update(agent, updateTo)}
              >
                <ArrowUpCircle size={15} />
              </IconButton>
            </Tooltip>
          )}
          {access.canRotate && (
            <Tooltip content="Сменить ключ">
              <IconButton
                aria-label="Сменить ключ"
                loading={actions.isBusy("rotate", agent.id)}
                onClick={() => void actions.rotateKey(agent)}
              >
                <KeyRound size={15} />
              </IconButton>
            </Tooltip>
          )}
          {access.canRevoke && (
            <Tooltip content="Отозвать">
              <IconButton
                aria-label="Отозвать"
                variant="destructive"
                loading={actions.isBusy("revoke", agent.id)}
                onClick={() => void actions.revoke(agent)}
              >
                <Ban size={15} />
              </IconButton>
            </Tooltip>
          )}
          {access.canDelete && (
            <Tooltip content="Удалить">
              <IconButton
                aria-label="Удалить"
                variant="destructive"
                loading={actions.isBusy("remove", agent.id)}
                onClick={() => void actions.remove(agent)}
              >
                <Trash2 size={15} />
              </IconButton>
            </Tooltip>
          )}
        </TableRowActions>
      );
    },
  }),
];
