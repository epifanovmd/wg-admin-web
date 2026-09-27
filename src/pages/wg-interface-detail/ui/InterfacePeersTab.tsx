import { useNavigate } from "@tanstack/react-router";
import { WgPeersFiltersBar, WgPeersTable } from "@widgets/wg-peers-table";
import { observer } from "mobx-react-lite";
import { FC } from "react";

import type { WgInterfaceDetailVM } from "../model/useWgInterfaceDetailVM";

interface InterfacePeersTabProps {
  vm: WgInterfaceDetailVM;
}

/** Пиры интерфейса с фильтрами; строка открывает пира. */
export const InterfacePeersTab: FC<InterfacePeersTabProps> = observer(
  ({ vm }) => {
    const navigate = useNavigate();
    const { peers } = vm;

    return (
      <div className="flex min-h-0 flex-1 flex-col gap-3">
        <WgPeersFiltersBar
          filters={vm.peerFilters}
          onChange={vm.setPeerFilters}
          withLocation={false}
          withOwner={peers.canViewAll}
        />
        <WgPeersTable
          vm={peers}
          onRowClick={peer =>
            navigate({
              to: "/wg/peers/$peerId",
              params: { peerId: peer.id },
            })
          }
        />
      </div>
    );
  },
);
