import { PermissionGate } from "@entities/user";
import { WG_PERMISSIONS } from "@entities/wg";
import { AssignWgOwnerModal } from "@features/assign-wg-owner";
import {
  ProvisionWgNodeModal,
  WgNodeFormModal,
} from "@features/manage-wg-node";
import { ownPermission } from "@shared/lib/access";
import { Button, PageHeader, PageLayout } from "@shared/ui";
import { Plus } from "lucide-react";
import { observer } from "mobx-react-lite";
import { FC } from "react";

import { useWgNodesVM } from "../model/useWgNodesVM";
import { NodeMeshCard } from "./NodeMeshCard";
import { WgNodesTable } from "./WgNodesTable";

export const WgNodesPage: FC = observer(() => {
  const vm = useWgNodesVM();

  return (
    <PageLayout
      header={
        <PageHeader
          title="Ноды"
          subtitle="VPS с агентами WireGuard: статусы, конфигурация, установка"
          actions={
            vm.canCreate && (
              <Button
                leftIcon={<Plus size={15} />}
                onClick={vm.form.openCreate}
              >
                Новая нода
              </Button>
            )
          }
        />
      }
    >
      <PermissionGate permission={ownPermission(WG_PERMISSIONS.NODE_VIEW)}>
        <WgNodesTable vm={vm} />
        {vm.mesh && <NodeMeshCard matrix={vm.mesh} />}
      </PermissionGate>
      <WgNodeFormModal vm={vm.form} />
      <ProvisionWgNodeModal vm={vm.provision} />
      <AssignWgOwnerModal vm={vm.owner} />
    </PageLayout>
  );
});
