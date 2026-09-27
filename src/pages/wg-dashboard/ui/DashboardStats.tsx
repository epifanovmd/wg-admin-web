import { formatBps, formatTraffic, WgRxTx } from "@entities/wg";
import { cn } from "@shared/lib/utils";
import { Skeleton, StatCard } from "@shared/ui";
import { Database, Gauge, Network, Server, Users } from "lucide-react";
import { observer } from "mobx-react-lite";
import { FC } from "react";

import type { WgDashboardVM } from "../model/useWgDashboardVM";

interface DashboardCardProps {
  vm: WgDashboardVM;
}

/** Сводка: ноды и интерфейсы (администратору), пиры, скорость, трафик. */
export const DashboardStats: FC<DashboardCardProps> = observer(({ vm }) => {
  const { overview } = vm;
  // Администратор видит ноды и интерфейсы, пользователь — только свои пиры.
  const grid = cn(
    "grid grid-cols-2 gap-3 sm:grid-cols-3",
    vm.canViewGlobal && "lg:grid-cols-5",
  );

  if (!overview) {
    return (
      <div className={grid}>
        {Array.from({ length: vm.canViewGlobal ? 5 : 3 }, (_, index) => (
          <Skeleton key={index} className="h-24" />
        ))}
      </div>
    );
  }

  return (
    <div className={grid}>
      {vm.canViewGlobal && (
        <>
          <StatCard
            title="Ноды"
            value={`${overview.nodes.online} / ${overview.nodes.total}`}
            description="на связи / всего"
            icon={<Server />}
          />
          <StatCard
            title="Интерфейсы"
            value={`${overview.interfaces.enabled} / ${overview.interfaces.total}`}
            description="включено / всего"
            icon={<Network />}
          />
        </>
      )}
      <StatCard
        title="Пиры"
        value={`${overview.peers.online} / ${overview.peers.total}`}
        description="онлайн / всего"
        icon={<Users />}
      />
      <StatCard
        title="Скорость"
        value={
          <WgRxTx
            rx={formatBps(overview.rxBps)}
            tx={formatBps(overview.txBps)}
          />
        }
        icon={<Gauge />}
      />
      <StatCard
        title="Трафик"
        value={formatTraffic(overview.rxTotal + overview.txTotal)}
        description={
          <WgRxTx
            inline
            rx={formatTraffic(overview.rxTotal)}
            tx={formatTraffic(overview.txTotal)}
          />
        }
        icon={<Database />}
      />
    </div>
  );
});
