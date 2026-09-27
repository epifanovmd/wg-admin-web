import { PermissionGate } from "@entities/user";
import { WG_PERMISSIONS } from "@entities/wg";
import { PageHeader, PageLayout } from "@shared/ui";
import { FC } from "react";

import { WgStatsContent } from "./WgStatsContent";

const header = (
  <PageHeader
    title="Статистика"
    subtitle="Скорость и трафик с фильтрами по нодам, интерфейсам и пирам"
  />
);

export const WgStatsPage: FC = () => (
  <PageLayout header={header}>
    <PermissionGate permission={WG_PERMISSIONS.STATS_VIEW}>
      <WgStatsContent />
    </PermissionGate>
  </PageLayout>
);
