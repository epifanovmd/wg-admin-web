import { PermissionGate } from "@entities/user";
import { KnownPermission } from "@shared/api/gen/main/model";
import { PageHeader, PageLayout } from "@shared/ui";
import { FC } from "react";

import { AdminApiKeysContent } from "./AdminApiKeysContent";

const header = (
  <PageHeader title="API-ключи" subtitle="Доступ для воркеров и интеграций" />
);

export const AdminApiKeysPage: FC = () => (
  <PageLayout header={header} fill>
    <PermissionGate permission={KnownPermission["apikey:manage"]}>
      <AdminApiKeysContent />
    </PermissionGate>
  </PageLayout>
);
