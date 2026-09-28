import { ADMIN_PERMISSIONS, PermissionGate } from "@entities/user";
import { PageHeader, PageLayout } from "@shared/ui";
import { FC } from "react";

import { AdminRolesContent } from "./AdminRolesContent";

const header = (
  <PageHeader title="Роли" subtitle="Наборы прав для пользователей" />
);

export const AdminRolesPage: FC = () => (
  <PageLayout header={header}>
    <PermissionGate permission={ADMIN_PERMISSIONS.ROLE_VIEW}>
      <AdminRolesContent />
    </PermissionGate>
  </PageLayout>
);
