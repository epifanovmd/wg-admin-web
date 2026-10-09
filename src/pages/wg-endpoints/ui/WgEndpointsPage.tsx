import { PermissionGate } from "@entities/user";
import { WG_PERMISSIONS } from "@entities/wg";
import { AssignWgOwnerModal } from "@features/assign-wg-owner";
import { WgEndpointFormModal } from "@features/manage-wg-endpoint";
import { ownPermission } from "@shared/lib/access";
import { Button, PageHeader, PageLayout } from "@shared/ui";
import { Plus } from "lucide-react";
import { observer } from "mobx-react-lite";
import { FC } from "react";

import { useWgEndpointsVM } from "../model/useWgEndpointsVM";
import { WgEndpointsTable } from "./WgEndpointsTable";

export const WgEndpointsPage: FC = observer(() => {
  const vm = useWgEndpointsVM();

  return (
    <PageLayout
      header={
        <PageHeader
          title="Точки подключения"
          subtitle="Стабильные адреса клиентов: смена ноды или релея не требует новых конфигов"
          actions={
            vm.canCreate && (
              <Button
                leftIcon={<Plus size={15} />}
                onClick={vm.form.openCreate}
              >
                Новая точка
              </Button>
            )
          }
        />
      }
    >
      <PermissionGate permission={ownPermission(WG_PERMISSIONS.ENDPOINT_VIEW)}>
        <WgEndpointsTable vm={vm} />
      </PermissionGate>
      <WgEndpointFormModal vm={vm.form} />
      <AssignWgOwnerModal vm={vm.owner} />
    </PageLayout>
  );
});
