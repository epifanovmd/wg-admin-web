import { WgToggleSwitch } from "@entities/wg";
import type { EWgForwardRoute, WgForwardDto } from "@shared/api/gen/main/model";
import {
  Badge,
  createColumnHelper,
  IconButton,
  Segmented,
  TableRowActions,
  Tooltip,
} from "@shared/ui";
import { Pencil, Trash2, UserCog } from "lucide-react";
import type { RefObject } from "react";

import type { WgForwardsVM } from "../model/useWgForwardsVM";

const column = createColumnHelper<WgForwardDto>();

const ROUTES: Array<{ value: EWgForwardRoute; label: string }> = [
  { value: "auto", label: "Авто" },
  { value: "tunnel", label: "Туннель" },
  { value: "direct", label: "Напрямую" },
];

interface ForwardColumnsOptions {
  /** VM — через ref: колонки стабильны, ячейки не перемонтируются. */
  vm: RefObject<WgForwardsVM>;
}

/** Колонки таблицы пробросов. */
export const createForwardColumns = ({ vm }: ForwardColumnsOptions) => [
  column.display({
    id: "forward",
    header: "Проброс",
    cell: ({ row }) => (
      <div className="min-w-0">
        <p className="truncate font-medium">{row.original.name}</p>
        <p className="font-mono text-xs text-muted-foreground">
          {row.original.relayNodeName ?? "релей"} :{row.original.listenPort}/
          {row.original.protocol}
        </p>
      </div>
    ),
  }),
  column.display({
    id: "target",
    header: "Цель",
    cell: ({ row }) => {
      const forward = row.original;

      return (
        <div className="text-xs">
          <p className="font-mono">
            {forward.targetNodeName ?? forward.targetHost}:{forward.targetPort}
          </p>
          <p className="text-muted-foreground">
            {forward.path === "ipip" ? "через IPIP-туннель" : "напрямую"}
            {forward.path === "ipip" &&
              forward.targetHost &&
              ` · аварийно ${forward.targetHost}`}
          </p>
        </div>
      );
    },
  }),
  column.display({
    id: "route",
    header: "Маршрут",
    size: 280,
    cell: ({ row }) => {
      const forward = row.original;

      if (forward.path !== "ipip") {
        return <span className="text-xs text-muted-foreground">напрямую</span>;
      }

      return (
        <div className="flex items-center gap-2">
          <Segmented<EWgForwardRoute>
            size="sm"
            options={ROUTES}
            value={forward.route}
            disabled={!vm.current.accessOf(forward).canUpdate}
            onValueChange={route => void vm.current.setRoute(forward, route)}
          />
          {forward.activeRoute && (
            <Tooltip content="Маршрут по отчёту агента релея">
              <span className="inline-flex">
                <Badge
                  variant={
                    forward.activeRoute === "tunnel" ? "success" : "warning"
                  }
                >
                  {forward.activeRoute === "tunnel" ? "туннель" : "напрямую"}
                </Badge>
              </span>
            </Tooltip>
          )}
        </div>
      );
    },
  }),
  column.display({
    id: "actions",
    size: 170,
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
            <>
              <WgToggleSwitch
                enabled={row.original.enabled}
                onToggle={() => vm.current.toggle(row.original)}
              />
              <Tooltip content="Изменить">
                <IconButton
                  aria-label="Изменить"
                  onClick={() => vm.current.form.openEdit(row.original)}
                >
                  <Pencil size={15} />
                </IconButton>
              </Tooltip>
            </>
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
