import { PermissionGate } from "@entities/user";
import { WG_PERMISSIONS, WgInterfaceStatusBadge } from "@entities/wg";
import {
  MoveWgInterfaceModal,
  WgInterfaceFormModal,
} from "@features/manage-wg-interface";
import { WgPeerFormModal } from "@features/manage-wg-peer";
import { WgPeerConfigModal } from "@features/wg-peer-config";
import {
  Alert,
  Button,
  PageEmpty,
  PageHeader,
  PageLayout,
  PageLoader,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@shared/ui";
import { Link } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { observer } from "mobx-react-lite";
import { FC, useState } from "react";

import { useWgInterfaceDetailVM } from "../model/useWgInterfaceDetailVM";
import { InterfaceActions } from "./InterfaceActions";
import { InterfaceOverviewTab } from "./InterfaceOverviewTab";
import { InterfacePeersTab } from "./InterfacePeersTab";

interface WgInterfaceDetailProps {
  interfaceId: string;
}

/** Карточка интерфейса: шапка с действиями, вкладки обзора и пиров. */
export const WgInterfaceDetail: FC<WgInterfaceDetailProps> = observer(
  ({ interfaceId }) => {
    const vm = useWgInterfaceDetailVM(interfaceId);
    const iface = vm.iface.data;
    const [tab, setTab] = useState("overview");

    return (
      <PageLayout
        fill
        header={
          iface && (
            <PageHeader
              title={
                <span className="flex items-center gap-3">
                  <span className="font-mono">{iface.name}</span>
                  <WgInterfaceStatusBadge
                    status={iface.status}
                    message={iface.statusMessage}
                    enabled={iface.enabled}
                  />
                </span>
              }
              subtitle={
                <Link
                  to="/wg/nodes/$nodeId"
                  params={{ nodeId: iface.nodeId }}
                  className="hover:underline"
                >
                  {iface.nodeName ?? "нода"}
                </Link>
              }
              actions={
                vm.canManage && <InterfaceActions vm={vm} iface={iface} />
              }
            />
          )
        }
      >
        <PermissionGate permission={WG_PERMISSIONS.INTERFACE_VIEW}>
          {!iface ? (
            vm.iface.isError ? (
              <PageEmpty icon="error" title="Интерфейс не найден" />
            ) : (
              <PageLoader label="Загрузка интерфейса…" />
            )
          ) : (
            <>
              {iface.status === "error" && iface.statusMessage && (
                <Alert variant="destructive" title="Ошибка интерфейса">
                  {iface.statusMessage}
                </Alert>
              )}
              <Tabs
                value={tab}
                onValueChange={setTab}
                className="flex min-h-0 flex-1 flex-col"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <TabsList>
                    <TabsTrigger value="overview">Обзор</TabsTrigger>
                    <TabsTrigger value="peers">Пиры</TabsTrigger>
                  </TabsList>
                  {tab === "peers" && vm.peers.canManage && (
                    <Button
                      leftIcon={<Plus size={15} />}
                      onClick={vm.peers.form.openCreate}
                    >
                      Новый пир
                    </Button>
                  )}
                </div>
                <TabsContent
                  value="overview"
                  className="min-h-0 flex-1 overflow-auto pt-4"
                >
                  <InterfaceOverviewTab vm={vm} iface={iface} />
                </TabsContent>
                <TabsContent
                  value="peers"
                  className="flex min-h-0 flex-1 flex-col pt-4"
                >
                  <InterfacePeersTab vm={vm} />
                </TabsContent>
              </Tabs>
            </>
          )}
        </PermissionGate>
        <WgInterfaceFormModal vm={vm.form} />
        <WgPeerFormModal vm={vm.peers.form} />
        <WgPeerConfigModal vm={vm.peers.config} />
        <MoveWgInterfaceModal vm={vm.move} />
      </PageLayout>
    );
  },
);
