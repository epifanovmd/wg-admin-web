import { PermissionGate } from "@entities/user";
import { KnownPermission } from "@shared/api/gen/main/model";
import { PageHeader, PageLayout } from "@shared/ui";
import { FC } from "react";

import { AdminRolesContent } from "./AdminRolesContent";

const header = (
  <PageHeader title="Роли" subtitle="Наборы прав для пользователей" />
);

export const AdminRolesPage: FC = () => (
  <PageLayout header={header}>
    <PermissionGate permission={KnownPermission["role:view"]}>
      <AdminRolesContent />
    </PermissionGate>
  </PageLayout>
);
