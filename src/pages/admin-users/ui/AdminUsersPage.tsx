import { PermissionGate } from "@entities/user";
import { KnownPermission } from "@shared/api/gen/main/model";
import { PageHeader, PageLayout } from "@shared/ui";
import { FC } from "react";

import { AdminUsersContent } from "./AdminUsersContent";

const header = (
  <PageHeader title="Пользователи" subtitle="Учётные записи и их права" />
);

export const AdminUsersPage: FC = () => (
  <PageLayout header={header} fill>
    <PermissionGate permission={KnownPermission["user:view"]}>
      <AdminUsersContent />
    </PermissionGate>
  </PageLayout>
);
