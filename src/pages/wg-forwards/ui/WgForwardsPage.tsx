import { PermissionGate } from "@entities/user";
import { WG_PERMISSIONS } from "@entities/wg";
import { WgForwardFormModal } from "@features/manage-wg-forward";
import { Button, Card, PageHeader, PageLayout } from "@shared/ui";
import { Plus } from "lucide-react";
import { observer } from "mobx-react-lite";
import { FC } from "react";

import { useRelayedInterfacesVM } from "../model/useRelayedInterfacesVM";
import { useWgForwardsVM } from "../model/useWgForwardsVM";
import { RelayedInterfacesTable } from "./RelayedInterfacesTable";
import { WgForwardsTable } from "./WgForwardsTable";

export const WgForwardsPage: FC = observer(() => {
  const vm = useWgForwardsVM();
  const relayed = useRelayedInterfacesVM();

  return (
    <PageLayout
      header={
        <PageHeader
          title="Пробросы"
          subtitle="Что и куда пересылают релеи: ручные пробросы на внешние сервисы и точки подключения интерфейсов"
          actions={
            vm.canCreate && (
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
      {relayed.canView && (
        <Card
          title="Точки подключения через релей"
          description="Создаются автоматически для интерфейсов с точкой через релей: релей шлёт трафик на живую копию интерфейса, здесь — куда он идёт сейчас и закрепление"
        >
          <RelayedInterfacesTable vm={relayed} />
        </Card>
      )}
      <WgForwardFormModal vm={vm.form} />
    </PageLayout>
  );
});
