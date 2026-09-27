import { AuditEventTable } from "@entities/audit";
import { PageHeader, PageLayout } from "@shared/ui";
import { FC } from "react";

import { useActivityVM } from "../model/useActivityVM";

const header = (
  <PageHeader
    title="Мой журнал"
    subtitle="Входы и изменения безопасности аккаунта"
  />
);

export const ActivityPage: FC = () => {
  const { feed } = useActivityVM();

  return (
    <PageLayout header={header}>
      <AuditEventTable feed={feed} />
    </PageLayout>
  );
};
