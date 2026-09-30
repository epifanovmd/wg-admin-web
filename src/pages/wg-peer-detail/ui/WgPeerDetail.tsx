import { PermissionGate } from "@entities/user";
import {
  formatInterfaceLabel,
  WG_PERMISSIONS,
  WgPeerStateBadge,
} from "@entities/wg";
import { WgPeerFormModal } from "@features/manage-wg-peer";
import { WgPeerConfigModal } from "@features/wg-peer-config";
import { ownPermission } from "@shared/lib/access";
import { PageEmpty, PageHeader, PageLayout, PageLoader } from "@shared/ui";
import { Link } from "@tanstack/react-router";
import { observer } from "mobx-react-lite";
import { FC } from "react";

import { useWgPeerDetailVM } from "../model/useWgPeerDetailVM";
import { PeerHeaderActions } from "./PeerHeaderActions";
import { PeerOverview } from "./PeerOverview";

interface WgPeerDetailProps {
  peerId: string;
}

/** Карточка пира: шапка с действиями и показатели. */
export const WgPeerDetail: FC<WgPeerDetailProps> = observer(({ peerId }) => {
  const vm = useWgPeerDetailVM(peerId);
  const peer = vm.peer.data;

  return (
    <PageLayout
      header={
        peer && (
          <PageHeader
            title={
              <span className="flex items-center gap-3">
                {peer.name}
                <WgPeerStateBadge peer={peer} />
              </span>
            }
            subtitle={
              <span className="font-mono">
                {peer.addressV4}
                {peer.interfaceName && (
                  <>
                    {" · "}
                    <Link
                      to="/wg/interfaces/$interfaceId"
                      params={{ interfaceId: peer.interfaceId }}
                      className="hover:underline"
                    >
                      {formatInterfaceLabel({
                        name: peer.interfaceName,
                        nodeName: peer.nodeName,
                      })}
                    </Link>
                  </>
                )}
              </span>
            }
            actions={<PeerHeaderActions vm={vm} peer={peer} />}
          />
        )
      }
    >
      <PermissionGate permission={ownPermission(WG_PERMISSIONS.PEER_VIEW)}>
        {peer ? (
          <PeerOverview vm={vm} peer={peer} />
        ) : vm.peer.isError ? (
          <PageEmpty icon="error" title="Пир не найден" />
        ) : (
          <PageLoader label="Загрузка пира…" />
        )}
      </PermissionGate>
      <WgPeerFormModal vm={vm.form} />
      <WgPeerConfigModal vm={vm.config} />
    </PageLayout>
  );
});
