import { EndpointTargets } from "@features/manage-wg-endpoint";
import type { WgEndpointDto } from "@shared/api/gen/main/model";
import {
  createColumnHelper,
  IconButton,
  TableRowActions,
  Tooltip,
} from "@shared/ui";
import { Pencil, Trash2, TriangleAlert, UserCog } from "lucide-react";
import type { RefObject } from "react";

import type { WgEndpointsVM } from "../model/useWgEndpointsVM";
import { EndpointModeBadges } from "./EndpointModeBadges";

const column = createColumnHelper<WgEndpointDto>();

interface EndpointColumnsOptions {
  relayNodeName: (id: string | null) => string | null;
  /** Настройки, которые почти наверняка ведут трафик не туда. */
  warningsOf: (endpoint: WgEndpointDto) => string[];
  /** VM — через ref: колонки стабильны, ячейки не перемонтируются. */
  vm: RefObject<WgEndpointsVM>;
}

/** Колонки таблицы точек подключения. */
export const createEndpointColumns = ({
  relayNodeName,
  warningsOf,
  vm,
}: EndpointColumnsOptions) => [
  column.display({
    id: "name",
    header: "Точка",
    cell: ({ row }) => (
      <div className="min-w-0">
        <p className="font-medium">{row.original.name}</p>
        <p className="truncate font-mono text-xs text-muted-foreground">
          {row.original.host}
        </p>
      </div>
    ),
  }),
  column.display({
    id: "mode",
    header: "Режим",
    size: 220,
    cell: ({ row }) => {
      const endpoint = row.original;
      const warnings = warningsOf(endpoint);

      return (
        <div className="flex items-center gap-1.5">
          <EndpointModeBadges
            endpoint={endpoint}
            relayName={relayNodeName(endpoint.relayNodeId)}
          />
          {warnings.length > 0 && (
            <Tooltip content={warnings.join(" ")}>
              <TriangleAlert
                size={14}
                className="shrink-0 text-warning"
                aria-label="Проверьте настройку точки"
              />
            </Tooltip>
          )}
        </div>
      );
    },
  }),
  column.display({
    id: "targets",
    header: "Куда ведёт",
    size: 240,
    cell: ({ row }) => (
      <EndpointTargets interfaces={row.original.interfaces} dense />
    ),
  }),
  column.display({
    id: "description",
    header: "Описание",
    cell: ({ row }) => (
      <span className="text-xs text-muted-foreground">
        {row.original.description ?? "—"}
      </span>
    ),
  }),
  column.display({
    id: "actions",
    size: 130,
    meta: { align: "right" },
    cell: ({ row }) => {
      const access = vm.current.accessOf(row.original);

      return access.canUpdate || access.canDelete || access.canAssign ? (
        <TableRowActions>
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
      ) : null;
    },
  }),
];
