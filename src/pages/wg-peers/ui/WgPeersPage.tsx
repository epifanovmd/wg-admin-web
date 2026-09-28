import { PermissionGate } from "@entities/user";
import { WG_PERMISSIONS } from "@entities/wg";
import { WgPeerFormModal } from "@features/manage-wg-peer";
import { WgPeerConfigModal } from "@features/wg-peer-config";
import { Button, PageHeader, PageLayout } from "@shared/ui";
import { useNavigate, useSearch } from "@tanstack/react-router";
import {
  compactPeersFilters,
  type IWgPeersFilters,
  useWgPeersTableVM,
  WgPeersFiltersBar,
  WgPeersTable,
} from "@widgets/wg-peers-table";
import { Plus } from "lucide-react";
import { observer } from "mobx-react-lite";
import { FC } from "react";

export const WgPeersPage: FC = observer(() => {
  const filters = useSearch({ from: "/_app/wg/peers/" });
  const navigate = useNavigate({ from: "/wg/peers/" });
  const vm = useWgPeersTableVM(filters);

  const setFilters = (patch: Partial<IWgPeersFilters>) =>
    navigate({
      search: previous => compactPeersFilters({ ...previous, ...patch }),
      replace: true,
    });

  return (
    <PageLayout
      fill
      header={
        <PageHeader
          title={vm.canViewAll ? "Пиры" : "Мои пиры"}
          subtitle={
            vm.canViewAll
              ? "Все пиры WireGuard: состояние, трафик, управление"
              : "Ваши подключения: QR-код, конфиг и включение"
          }
          actions={
            vm.canCreate && (
              <Button
                leftIcon={<Plus size={15} />}
                onClick={vm.form.openCreate}
              >
                Новый пир
              </Button>
            )
          }
        />
      }
    >
      <PermissionGate
        permission={[WG_PERMISSIONS.PEER_VIEW, WG_PERMISSIONS.PEER_OWN]}
      >
        <WgPeersFiltersBar
          filters={filters}
          onChange={setFilters}
          withLocation={vm.canViewAll}
          withOwner={vm.canViewAll}
        />
        <WgPeersTable
          vm={vm}
          onRowClick={peer =>
            navigate({ to: "/wg/peers/$peerId", params: { peerId: peer.id } })
          }
        />
      </PermissionGate>
      <WgPeerFormModal vm={vm.form} />
      <WgPeerConfigModal vm={vm.config} />
    </PageLayout>
  );
});
