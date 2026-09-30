import {
  nodeSyncView,
  resolveAgentUpdate,
  WgNodeStatusBadge,
  WgOwnershipCell,
} from "@entities/wg";
import type {
  IWgAgentReleaseInfo,
  WgNodeDto,
} from "@shared/api/gen/main/model";
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
import { HardDriveDownload, Pencil, Trash2, UserCog } from "lucide-react";
import type { RefObject } from "react";

import type { WgNodesVM } from "../model/useWgNodesVM";

const column = createColumnHelper<WgNodeDto>();

interface NodeColumnsOptions {
  /** Раздаваемая бэкендом версия агента; null — не загружена или нет права. */
  release: IWgAgentReleaseInfo | null;
  /** VM — через ref: колонки стабильны, ячейки не перемонтируются. */
  vm: RefObject<WgNodesVM>;
}

/** Колонки таблицы нод. */
export const createNodeColumns = ({ release, vm }: NodeColumnsOptions) => [
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
    id: "owner",
    header: "Владелец",
    size: 160,
    cell: ({ row }) => (
      <WgOwnershipCell
        owner={row.original.ownerName}
        creator={row.original.createdByName}
      />
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
        <p className="flex items-center gap-1.5">
          {row.original.agentVersion ? `v${row.original.agentVersion}` : "—"}
          {resolveAgentUpdate(row.original, release) === "available" && (
            <Tooltip content={`Доступна версия агента v${release?.version}`}>
              <Badge
                variant="warning"
                aria-label={`Доступна версия агента v${release?.version}`}
              >
                обновление
              </Badge>
            </Tooltip>
          )}
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
      const view = nodeSyncView(row.original);
      const badge = <Badge variant={view.variant}>{view.label}</Badge>;

      return view.hint ? <Tooltip content={view.hint}>{badge}</Tooltip> : badge;
    },
  }),
  column.display({
    id: "actions",
    size: 130,
    meta: { align: "right" },
    cell: ({ row }) => {
      const access = vm.current.accessOf(row.original);

      return (
        <TableRowActions>
          {access.canProvision && (
            <Tooltip content="Установить агента">
              <IconButton
                aria-label="Установить агента"
                onClick={() => vm.current.provision.openFor(row.original)}
              >
                <HardDriveDownload size={15} />
              </IconButton>
            </Tooltip>
          )}
          {access.canAssign && (
            <Tooltip content="Владелец">
              <IconButton
                aria-label="Владелец"
                onClick={() => vm.current.openOwner(row.original)}
              >
                <UserCog size={15} />
              </IconButton>
            </Tooltip>
          )}
          {access.canUpdate && (
            <Tooltip content="Изменить">
              <IconButton
                aria-label="Изменить"
                onClick={() => vm.current.form.openEdit(row.original)}
              >
                <Pencil size={15} />
              </IconButton>
            </Tooltip>
          )}
          {access.canDelete && (
            <Tooltip content="Удалить">
              <IconButton
                aria-label="Удалить"
                variant="destructive"
                onClick={() => void vm.current.remove(row.original)}
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
