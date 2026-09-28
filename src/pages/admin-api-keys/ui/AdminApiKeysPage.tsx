import { ADMIN_PERMISSIONS, PermissionGate } from "@entities/user";
import { PageHeader, PageLayout } from "@shared/ui";
import { FC } from "react";

import { AdminApiKeysContent } from "./AdminApiKeysContent";

const header = (
  <PageHeader title="API-ключи" subtitle="Доступ для воркеров и интеграций" />
);

export const AdminApiKeysPage: FC = () => (
  <PageLayout header={header} fill>
    <PermissionGate permission={ADMIN_PERMISSIONS.APIKEY_VIEW}>
      <AdminApiKeysContent />
    </PermissionGate>
  </PageLayout>
);
