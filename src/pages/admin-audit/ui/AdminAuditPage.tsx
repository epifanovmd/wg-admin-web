import { ADMIN_PERMISSIONS, PermissionGate } from "@entities/user";
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
    <PermissionGate permission={ADMIN_PERMISSIONS.AUDIT_VIEW}>
      <AdminAuditContent />
    </PermissionGate>
  </PageLayout>
);
