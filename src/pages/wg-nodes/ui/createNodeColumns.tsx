import { WgNodeStatusBadge } from "@entities/wg";
import type { WgNodeDto } from "@shared/api/gen/main/model";
import { formatter } from "@shared/lib/utils";
import {
  Badge,
  createColumnHelper,
  IconButton,
  stopRowClick,
  TableRowActions,
  Tooltip,
} from "@shared/ui";
import { Link } from "@tanstack/react-router";
import { HardDriveDownload, Pencil, Trash2 } from "lucide-react";
import type { RefObject } from "react";

import type { WgNodesVM } from "../model/useWgNodesVM";

const column = createColumnHelper<WgNodeDto>();

interface NodeColumnsOptions {
  canManage: boolean;
  canProvision: boolean;
  /** VM — через ref: колонки стабильны, ячейки не перемонтируются. */
  vm: RefObject<WgNodesVM>;
}

/** Колонки таблицы нод. */
export const createNodeColumns = ({
  canManage,
  canProvision,
  vm,
}: NodeColumnsOptions) => [
  column.display({
    id: "name",
    header: "Нода",
    cell: ({ row }) => (
      <div className="min-w-0">
        <Link
          to="/wg/nodes/$nodeId"
          params={{ nodeId: row.original.id }}
          className="truncate font-medium hover:underline"
          onClick={stopRowClick}
        >
          {row.original.name}
        </Link>
        <p className="truncate text-xs text-muted-foreground">
          {row.original.publicHost ?? "хост не задан"}
          {row.original.description && ` · ${row.original.description}`}
        </p>
      </div>
    ),
  }),
  column.display({
    id: "status",
    header: "Статус",
    size: 130,
    cell: ({ row }) => <WgNodeStatusBadge status={row.original.status} />,
  }),
  column.display({
    id: "agent",
    header: "Агент",
    size: 190,
    cell: ({ row }) => (
      <div className="text-xs text-muted-foreground">
        <p>
          {row.original.agentVersion ? `v${row.original.agentVersion}` : "—"}
        </p>
        <p>
          {row.original.lastSeenAt
            ? formatter.date.format(row.original.lastSeenAt)
            : "не выходил на связь"}
        </p>
      </div>
    ),
  }),
  column.display({
    id: "sync",
    header: "Конфигурация",
    size: 140,
    cell: ({ row }) => {
      const node = row.original;

      if (node.applyError) {
        return (
          <Tooltip content={node.applyError}>
            <Badge variant="destructive">Ошибка применения</Badge>
          </Tooltip>
        );
      }

      return node.inSync ? (
        <Badge variant="success">Актуальна</Badge>
      ) : (
        <Badge variant="warning">Применяется…</Badge>
      );
    },
  }),
  column.display({
    id: "actions",
    size: 130,
    meta: { align: "right" },
    cell: ({ row }) => (
      <TableRowActions>
        {canProvision && (
          <Tooltip content="Установить агента">
            <IconButton
              aria-label="Установить агента"
              onClick={() => vm.current.provision.openFor(row.original)}
            >
              <HardDriveDownload size={15} />
            </IconButton>
          </Tooltip>
        )}
        {canManage && (
          <>
            <Tooltip content="Изменить">
              <IconButton
                aria-label="Изменить"
                onClick={() => vm.current.form.openEdit(row.original)}
              >
                <Pencil size={15} />
              </IconButton>
            </Tooltip>
            <Tooltip content="Удалить">
              <IconButton
                aria-label="Удалить"
                variant="destructive"
                onClick={() => void vm.current.remove(row.original)}
              >
                <Trash2 size={15} />
              </IconButton>
            </Tooltip>
          </>
        )}
      </TableRowActions>
    ),
  }),
];
