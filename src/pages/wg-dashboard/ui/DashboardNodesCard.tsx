import { formatBps, WgNodeStatusBadge, WgRxTx } from "@entities/wg";
import { Button, Card, Empty } from "@shared/ui";
import { Link } from "@tanstack/react-router";
import { observer } from "mobx-react-lite";
import { FC } from "react";

import type { WgDashboardVM } from "../model/useWgDashboardVM";

interface DashboardCardProps {
  vm: WgDashboardVM;
}

/** Ноды: статус и текущая скорость. */
export const DashboardNodesCard: FC<DashboardCardProps> = observer(({ vm }) => (
  <Card
    title="Ноды"
    description="Состояние и текущая скорость"
    extra={
      <Button variant="ghost" size="sm" asChild>
        <Link to="/wg/nodes">Все ноды</Link>
      </Button>
    }
  >
    {vm.nodes.length === 0 ? (
      <Empty
        size="sm"
        title="Нод пока нет"
        description="Создайте ноду и установите агента по SSH"
      />
    ) : (
      <div className="flex flex-col divide-y divide-border">
        {vm.nodes.map(node => {
          const live = vm.nodeLive.get(node.id);

          return (
            <div
              key={node.id}
              className="flex items-center justify-between gap-3 py-2.5"
            >
              <div className="min-w-0">
                <Link
                  to="/wg/nodes/$nodeId"
                  params={{ nodeId: node.id }}
                  className="truncate text-sm font-medium hover:underline"
                >
                  {node.name}
                </Link>
                <p className="truncate text-xs text-muted-foreground">
                  {node.publicHost ?? "—"}
                  {live && ` · пиров онлайн: ${live.peersOnline}`}
                </p>
              </div>
              <div className="flex items-center gap-3">
                {live && (
                  <WgRxTx
                    inline
                    rx={formatBps(live.rxBps)}
                    tx={formatBps(live.txBps)}
                    className="hidden whitespace-nowrap font-mono text-xs sm:inline-flex"
                  />
                )}
                <WgNodeStatusBadge status={node.status} />
              </div>
            </div>
          );
        })}
      </div>
    )}
  </Card>
));
