import { PermissionGate } from "@entities/user";
import { KnownPermission } from "@shared/api/gen/main/model";
import { PageHeader, PageLayout } from "@shared/ui";
import { FC } from "react";

import { AdminAuditContent } from "./AdminAuditContent";

const header = (
  <PageHeader
    title="Журнал аудита"
    subtitle="События безопасности всех пользователей"
  />
);

export const AdminAuditPage: FC = () => (
  <PageLayout header={header}>
    <PermissionGate permission={KnownPermission["audit:view"]}>
      <AdminAuditContent />
    </PermissionGate>
  </PageLayout>
);
