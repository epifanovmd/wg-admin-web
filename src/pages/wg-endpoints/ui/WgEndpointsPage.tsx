import { PermissionGate } from "@entities/user";
import { WG_PERMISSIONS } from "@entities/wg";
import { WgEndpointFormModal } from "@features/manage-wg-endpoint";
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
          subtitle="Стабильные адреса клиентов: смена ноды или релея не требует перевыпуска конфигов"
          actions={
            vm.canManage && (
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
      <PermissionGate permission={WG_PERMISSIONS.ENDPOINT_VIEW}>
        <WgEndpointsTable vm={vm} />
      </PermissionGate>
      <WgEndpointFormModal vm={vm.form} />
    </PageLayout>
  );
});
