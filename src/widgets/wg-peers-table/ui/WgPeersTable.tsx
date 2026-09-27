import {
  formatHandshakeAgo,
  formatInterfaceLabel,
  formatTraffic,
  WgPeerStateBadge,
  WgRxTx,
  WgToggleSwitch,
} from "@entities/wg";
import type { WgPeerDto } from "@shared/api/gen/main/model";
import { useLatestRef } from "@shared/lib/hooks";
import { formatter } from "@shared/lib/utils";
import {
  createColumnHelper,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Empty,
  IconButton,
  Pagination,
  stopRowClick,
  Table,
  TableRowActions,
  Tooltip,
} from "@shared/ui";
import { Link } from "@tanstack/react-router";
import { MoreHorizontal, QrCode } from "lucide-react";
import { observer } from "mobx-react-lite";
import { FC, RefObject, useMemo } from "react";

import type { WgPeersTableVM } from "../model/useWgPeersTableVM";

const column = createColumnHelper<WgPeerDto>();

/** VM — через ref: колонки стабильны, ячейки не перемонтируются. */
const createColumns = (
  canManage: boolean,
  vmRef: RefObject<WgPeersTableVM>,
) => [
  column.display({
    id: "peer",
    header: "Пир",
    cell: ({ row }) => (
      <div className="min-w-0">
        <Link
          to="/wg/peers/$peerId"
          params={{ peerId: row.original.id }}
          className="truncate font-medium hover:underline"
          onClick={stopRowClick}
        >
          {row.original.name}
        </Link>
        <p className="truncate font-mono text-xs text-muted-foreground">
          {row.original.addressV4}
          {row.original.interfaceName && (
            <>
              {" · "}
              <Link
                to="/wg/interfaces/$interfaceId"
                params={{ interfaceId: row.original.interfaceId }}
                className="hover:underline"
                onClick={stopRowClick}
              >
                {formatInterfaceLabel({
                  name: row.original.interfaceName,
                  nodeName: row.original.nodeName,
                })}
              </Link>
            </>
          )}
        </p>
      </div>
    ),
  }),
  column.display({
    id: "state",
    header: "Состояние",
    size: 120,
    cell: ({ row }) => <WgPeerStateBadge peer={row.original} />,
  }),
  column.display({
    id: "traffic",
    header: "Трафик",
    size: 130,
    cell: ({ row }) => (
      <WgRxTx
        rx={formatTraffic(row.original.rxBytesTotal)}
        tx={formatTraffic(row.original.txBytesTotal)}
        className="whitespace-nowrap font-mono text-xs"
      />
    ),
  }),
  column.display({
    id: "handshake",
    header: "Handshake",
    size: 150,
    cell: ({ row }) => (
      <div className="text-xs text-muted-foreground">
        <p>{formatHandshakeAgo(row.original.lastHandshakeAt)}</p>
        {row.original.lastEndpoint && (
          <p className="font-mono">{row.original.lastEndpoint}</p>
        )}
      </div>
    ),
  }),
  column.display({
    id: "expires",
    header: "Срок",
    size: 130,
    cell: ({ row }) =>
      row.original.expiresAt ? (
        <span className="text-xs text-muted-foreground">
          до {formatter.date.formatDate(row.original.expiresAt)}
        </span>
      ) : (
        <span className="text-xs text-muted-foreground">бессрочно</span>
      ),
  }),
  column.display({
    id: "actions",
    size: 130,
    meta: { align: "right" },
    cell: ({ row }) => {
      const peer = row.original;
      const vm = vmRef.current;

      return (
        <TableRowActions>
          {peer.hasPrivateKey && (
            <Tooltip content="QR и конфиг">
              <IconButton
                aria-label="QR и конфиг"
                onClick={() => void vm.config.openFor(peer)}
              >
                <QrCode size={15} />
              </IconButton>
            </Tooltip>
          )}
          <WgToggleSwitch
            enabled={peer.enabled}
            onToggle={() => vmRef.current.toggle(peer)}
          />
          {canManage && (
            <DropdownMenu>
              <Tooltip content="Действия">
                <span className="inline-flex">
                  <DropdownMenuTrigger asChild>
                    <IconButton aria-label="Действия">
                      <MoreHorizontal size={15} />
                    </IconButton>
                  </DropdownMenuTrigger>
                </span>
              </Tooltip>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onSelect={() => vm.form.openEdit(peer)}>
                  Изменить
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => void vm.rotatePsk(peer)}>
                  Перевыпустить PSK
                </DropdownMenuItem>
                <DropdownMenuItem
                  variant="destructive"
                  onSelect={() => void vm.remove(peer)}
                >
                  Удалить
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </TableRowActions>
      );
    },
  }),
];

export interface WgPeersTableProps {
  vm: WgPeersTableVM;
  onRowClick: (peer: WgPeerDto) => void;
}

/** Таблица пиров с пагинацией; строка ведёт на карточку пира. */
export const WgPeersTable: FC<WgPeersTableProps> = observer(
  ({ vm, onRowClick }) => {
    const { peers, canManage } = vm;
    const vmRef = useLatestRef(vm);
    const columns = useMemo(
      () => createColumns(canManage, vmRef),
      [canManage, vmRef],
    );

    return (
      <>
        <Table
          className="min-h-0 w-full flex-initial"
          stickyHeader
          data={peers.items}
          columns={columns}
          loading={peers.isLoading}
          refreshing={peers.isRefreshing}
          error={
            peers.error ? (
              <Empty size="sm" icon="error" title={peers.error.message} />
            ) : undefined
          }
          labels={{ empty: "Пиров пока нет" }}
          getRowId={peer => peer.id}
          onRowClick={onRowClick}
          aria-label="Пиры WireGuard"
        />
        {peers.pageCount > 1 && (
          <Pagination
            className="shrink-0 self-center"
            currentPage={peers.pagination.page}
            totalPages={peers.pageCount}
            disabled={peers.isBusy}
            onPageChange={page => peers.goToPage(page).then()}
          />
        )}
      </>
    );
  },
);
