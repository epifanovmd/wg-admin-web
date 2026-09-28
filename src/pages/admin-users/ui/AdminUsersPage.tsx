import { ADMIN_PERMISSIONS, PermissionGate } from "@entities/user";
import { PageHeader, PageLayout } from "@shared/ui";
import { FC } from "react";

import { AdminUsersContent } from "./AdminUsersContent";

const header = (
  <PageHeader title="Пользователи" subtitle="Учётные записи и их права" />
);

export const AdminUsersPage: FC = () => (
  <PageLayout header={header} fill>
    <PermissionGate permission={ADMIN_PERMISSIONS.USER_VIEW}>
      <AdminUsersContent />
    </PermissionGate>
  </PageLayout>
);
