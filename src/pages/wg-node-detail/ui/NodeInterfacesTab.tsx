import { WgToggleSwitch } from "@entities/wg";
import {
  hasAnyInterfaceAction,
  InterfaceStatusCompact,
  type IWgInterfacePermissions,
} from "@features/manage-wg-interface";
import type { WgInterfaceDto } from "@shared/api/gen/main/model";
import { useLatestRef } from "@shared/lib/hooks";
import {
  createColumnHelper,
  IconButton,
  stopRowClick,
  Table,
  TableRowActions,
  Tooltip,
} from "@shared/ui";
import { Link, useNavigate } from "@tanstack/react-router";
import { ArrowRightLeft, Copy, Pencil, RotateCcw, Trash2 } from "lucide-react";
import { FC, RefObject, useMemo } from "react";

interface NodeInterfacesTabProps {
  /** Нода страницы: строки-копии чужих интерфейсов — только просмотр. */
  nodeId: string;
  interfaces: WgInterfaceDto[];
  isLoading: boolean;
  permissions: IWgInterfacePermissions;
  onEdit: (iface: WgInterfaceDto) => void;
  onToggle: (iface: WgInterfaceDto) => Promise<boolean>;
  onRestart: (iface: WgInterfaceDto) => void;
  onDelete: (iface: WgInterfaceDto) => void;
  onMove: (iface: WgInterfaceDto) => void;
  onCopy: (iface: WgInterfaceDto) => void;
}

const column = createColumnHelper<WgInterfaceDto>();

type RowActions = Pick<
  NodeInterfacesTabProps,
  "onEdit" | "onToggle" | "onRestart" | "onDelete" | "onMove" | "onCopy"
>;

/** Обработчики — через ref: колонки стабильны, ячейки не перемонтируются. */
const createColumns = (
  nodeId: string,
  permissions: IWgInterfacePermissions,
  actions: RefObject<RowActions>,
) => [
  column.display({
    id: "name",
    header: "Интерфейс",
    cell: ({ row }) => (
      <div className="min-w-0">
        <Link
          to="/wg/interfaces/$interfaceId"
          params={{ interfaceId: row.original.id }}
          className="font-mono font-medium hover:underline"
          onClick={stopRowClick}
        >
          {row.original.name}
        </Link>
        {row.original.nodeId !== nodeId && (
          <p className="text-xs text-muted-foreground">
            копия · основная — {row.original.nodeName ?? "—"}
          </p>
        )}
        <p className="text-xs text-muted-foreground">
          {row.original.addressCidr}
          {row.original.addressV6Cidr && `, ${row.original.addressV6Cidr}`}
          {" · порт "}
          {row.original.listenPort}
        </p>
      </div>
    ),
  }),
  column.display({
    id: "endpoint",
    header: "Подключение клиентов",
    cell: ({ row }) => (
      <div className="text-xs">
        <p className="font-mono">
          {row.original.clientEndpoint ?? "адрес не задан"}
        </p>
        <p className="text-muted-foreground">
          {row.original.endpointId
            ? "через точку подключения"
            : "publicHost ноды"}
          {row.original.natEnabled && " · NAT"}
        </p>
      </div>
    ),
  }),
  column.display({
    id: "status",
    header: "Статус",
    size: 200,
    cell: ({ row }) => (
      <InterfaceStatusCompact iface={row.original} hostNodeId={nodeId} />
    ),
  }),
  column.display({
    id: "actions",
    size: 240,
    meta: { align: "right" },
    // Действия — у основной копии: перезапуск, перенос и удаление копии здесь
    // не про неё.
    cell: ({ row }) =>
      row.original.nodeId === nodeId && hasAnyInterfaceAction(permissions) ? (
        <TableRowActions>
          {permissions.canControl && (
            <>
              <WgToggleSwitch
                enabled={row.original.enabled}
                onToggle={() => actions.current.onToggle(row.original)}
              />
              <Tooltip content="Перезапустить">
                <IconButton
                  aria-label="Перезапустить"
                  onClick={() => actions.current.onRestart(row.original)}
                >
                  <RotateCcw size={15} />
                </IconButton>
              </Tooltip>
            </>
          )}
          {permissions.canReplicas && (
            <Tooltip content="Скопировать на ноду (реплика с теми же пирами)">
              <IconButton
                aria-label="Скопировать на ноду"
                onClick={() => actions.current.onCopy(row.original)}
              >
                <Copy size={15} />
              </IconButton>
            </Tooltip>
          )}
          {permissions.canMove && (
            <Tooltip content="Перенести на другую ноду">
              <IconButton
                aria-label="Перенести на другую ноду"
                onClick={() => actions.current.onMove(row.original)}
              >
                <ArrowRightLeft size={15} />
              </IconButton>
            </Tooltip>
          )}
          {permissions.canUpdate && (
            <Tooltip content="Изменить">
              <IconButton
                aria-label="Изменить"
                onClick={() => actions.current.onEdit(row.original)}
              >
                <Pencil size={15} />
              </IconButton>
            </Tooltip>
          )}
          {permissions.canDelete && (
            <Tooltip content="Удалить">
              <IconButton
                aria-label="Удалить"
                variant="destructive"
                onClick={() => actions.current.onDelete(row.original)}
              >
                <Trash2 size={15} />
              </IconButton>
            </Tooltip>
          )}
        </TableRowActions>
      ) : null,
  }),
];

/** Интерфейсы ноды: статусы, включение, перезапуск; строка открывает интерфейс. */
export const NodeInterfacesTab: FC<NodeInterfacesTabProps> = ({
  nodeId,
  interfaces,
  isLoading,
  permissions,
  ...actions
}) => {
  const navigate = useNavigate();
  const actionsRef = useLatestRef<RowActions>(actions);
  const columns = useMemo(
    () => createColumns(nodeId, permissions, actionsRef),
    [nodeId, permissions, actionsRef],
  );

  return (
    <Table
      className="w-full flex-none"
      data={interfaces}
      columns={columns}
      loading={isLoading}
      labels={{ empty: "Интерфейсов пока нет" }}
      getRowId={iface => iface.id}
      onRowClick={iface =>
        void navigate({
          to: "/wg/interfaces/$interfaceId",
          params: { interfaceId: iface.id },
        })
      }
      aria-label="Интерфейсы ноды"
    />
  );
};
