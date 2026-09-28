import { EndpointTargets } from "@features/manage-wg-endpoint";
import type {
  EWgEndpointRoute,
  WgEndpointDto,
} from "@shared/api/gen/main/model";
import {
  Badge,
  createColumnHelper,
  IconButton,
  TableRowActions,
  Tooltip,
} from "@shared/ui";
import { Pencil, Trash2 } from "lucide-react";
import type { RefObject } from "react";

import type { WgEndpointsVM } from "../model/useWgEndpointsVM";

const column = createColumnHelper<WgEndpointDto>();

const ROUTE_LABEL: Record<EWgEndpointRoute, string> = {
  auto: "авто",
  tunnel: "только туннель",
  direct: "напрямую",
};

interface EndpointColumnsOptions {
  canUpdate: boolean;
  canDelete: boolean;
  relayNodeName: (id: string | null) => string | null;
  /** VM — через ref: колонки стабильны, ячейки не перемонтируются. */
  vm: RefObject<WgEndpointsVM>;
}

/** Колонки таблицы точек подключения. */
export const createEndpointColumns = ({
  canUpdate,
  canDelete,
  relayNodeName,
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

      if (endpoint.mode === "direct") {
        return (
          <Tooltip content="Панель трафик не пересылает: хост должен вести прямо на ноду интерфейса">
            <Badge variant="outline">адрес ноды</Badge>
          </Tooltip>
        );
      }

      return (
        <div className="flex flex-wrap items-center gap-1">
          <Badge variant="info">
            релей: {relayNodeName(endpoint.relayNodeId) ?? "—"}
          </Badge>
          <Badge variant={endpoint.forwardMode === "ipip" ? "purple" : "muted"}>
            {endpoint.forwardMode === "ipip"
              ? `IPIP · ${ROUTE_LABEL[endpoint.route]}`
              : "DNAT"}
          </Badge>
        </div>
      );
    },
  }),
  column.display({
    id: "targets",
    header: "Куда ведёт",
    size: 240,
    cell: ({ row }) => <EndpointTargets interfaces={row.original.interfaces} />,
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
    size: 100,
    meta: { align: "right" },
    cell: ({ row }) =>
      canUpdate || canDelete ? (
        <TableRowActions>
          {canUpdate && (
            <Tooltip content="Изменить">
              <IconButton
                aria-label="Изменить"
                onClick={() => vm.current.form.openEdit(row.original)}
              >
                <Pencil size={15} />
              </IconButton>
            </Tooltip>
          )}
          {canDelete && (
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
      ) : null,
  }),
];
