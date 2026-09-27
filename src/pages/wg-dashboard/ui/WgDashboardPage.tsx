import { WgSpeedChart } from "@entities/wg";
import { WgPeerConfigModal } from "@features/wg-peer-config";
import { Card, PageHeader, PageLayout } from "@shared/ui";
import { observer } from "mobx-react-lite";
import { FC } from "react";

import { useWgDashboardVM } from "../model/useWgDashboardVM";
import { DashboardMyPeersCard } from "./DashboardMyPeersCard";
import { DashboardNodesCard } from "./DashboardNodesCard";
import { DashboardStats } from "./DashboardStats";

const header = (
  <PageHeader
    title="Дашборд"
    subtitle="Живая картина VPN: скорость, трафик, состояние"
  />
);

export const WgDashboardPage: FC = observer(() => {
  const vm = useWgDashboardVM();

  return (
    <PageLayout header={header}>
      <DashboardStats vm={vm} />
      {vm.canViewGlobal ? (
        <>
          <Card title="Скорость сети" description="Все ноды, live">
            <WgSpeedChart points={vm.speedPoints} height={260} />
          </Card>
          <DashboardNodesCard vm={vm} />
        </>
      ) : (
        <DashboardMyPeersCard vm={vm} />
      )}
      <WgPeerConfigModal vm={vm.config} />
    </PageLayout>
  );
});
