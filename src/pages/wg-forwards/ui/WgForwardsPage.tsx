import { PermissionGate } from "@entities/user";
import { WG_PERMISSIONS } from "@entities/wg";
import { WgForwardFormModal } from "@features/manage-wg-forward";
import { Button, PageHeader, PageLayout } from "@shared/ui";
import { Plus } from "lucide-react";
import { observer } from "mobx-react-lite";
import { FC } from "react";

import { useWgForwardsVM } from "../model/useWgForwardsVM";
import { WgForwardsTable } from "./WgForwardsTable";

export const WgForwardsPage: FC = observer(() => {
  const vm = useWgForwardsVM();

  return (
    <PageLayout
      header={
        <PageHeader
          title="Пробросы"
          subtitle="Порт на релее → внешний сервис: напрямую или через IPIP-туннель с аварийным прямым путём"
          actions={
            vm.canManage && (
              <Button
                leftIcon={<Plus size={15} />}
                onClick={vm.form.openCreate}
              >
                Новый проброс
              </Button>
            )
          }
        />
      }
    >
      <PermissionGate permission={WG_PERMISSIONS.FORWARD_VIEW}>
        <WgForwardsTable vm={vm} />
      </PermissionGate>
      <WgForwardFormModal vm={vm.form} />
    </PageLayout>
  );
});
