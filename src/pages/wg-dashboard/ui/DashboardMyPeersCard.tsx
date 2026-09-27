import { formatTraffic, WgPeerStateBadge, WgRxTx } from "@entities/wg";
import { Button, Card, Empty, IconButton, Tooltip } from "@shared/ui";
import { Link } from "@tanstack/react-router";
import { QrCode } from "lucide-react";
import { observer } from "mobx-react-lite";
import { FC } from "react";

import type { WgDashboardVM } from "../model/useWgDashboardVM";

interface DashboardCardProps {
  vm: WgDashboardVM;
}

/** Подключения пользователя VPN: состояние, трафик, QR и конфиг. */
export const DashboardMyPeersCard: FC<DashboardCardProps> = observer(
  ({ vm }) => (
    <Card
      title="Мои подключения"
      description="QR-код и конфиг — по кнопке"
      extra={
        <Button variant="ghost" size="sm" asChild>
          <Link to="/wg/peers">Все пиры</Link>
        </Button>
      }
    >
      {vm.myPeers.length === 0 && !vm.isMyPeersLoading ? (
        <Empty
          size="sm"
          title="Пиров пока нет"
          description="Попросите администратора выдать вам подключение"
        />
      ) : (
        <div className="flex flex-col divide-y divide-border">
          {vm.myPeers.map(peer => (
            <div
              key={peer.id}
              className="flex items-center justify-between gap-3 py-2.5"
            >
              <div className="min-w-0">
                <Link
                  to="/wg/peers/$peerId"
                  params={{ peerId: peer.id }}
                  className="truncate text-sm font-medium hover:underline"
                >
                  {peer.name}
                </Link>
                <p className="truncate font-mono text-xs text-muted-foreground">
                  {peer.addressV4} ·{" "}
                  <WgRxTx
                    inline
                    rx={formatTraffic(peer.rxBytesTotal)}
                    tx={formatTraffic(peer.txBytesTotal)}
                  />
                </p>
              </div>
              <div className="flex items-center gap-2">
                <WgPeerStateBadge peer={peer} />
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
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  ),
);
