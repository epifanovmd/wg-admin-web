import { PermissionGate } from "@entities/user";
import { WG_PERMISSIONS, WgNodeStatusBadge } from "@entities/wg";
import {
  MoveWgInterfaceModal,
  WgInterfaceFormModal,
} from "@features/manage-wg-interface";
import {
  ProvisionWgNodeModal,
  WgNodeFormModal,
} from "@features/manage-wg-node";
import { cn } from "@shared/lib/utils";
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
import { Plus } from "lucide-react";
import { observer } from "mobx-react-lite";
import { FC, useState } from "react";

import { useWgNodeDetailVM } from "../model/useWgNodeDetailVM";
import { NodeHeaderActions } from "./NodeHeaderActions";
import { NodeInterfacesTab } from "./NodeInterfacesTab";
import { NodeLogsRefreshButton } from "./NodeLogsRefreshButton";
import { NodeLogsTab } from "./NodeLogsTab";
import { NodeOverviewTab } from "./NodeOverviewTab";
import { ProvisionJobBanner } from "./ProvisionJobBanner";

interface WgNodeDetailProps {
  nodeId: string;
}

/** Карточка ноды: шапка с действиями и вкладки обзора, интерфейсов и журнала. */
export const WgNodeDetail: FC<WgNodeDetailProps> = observer(({ nodeId }) => {
  const vm = useWgNodeDetailVM(nodeId);
  const node = vm.node.data;
  // Журнал — на всю высоту экрана с прокруткой внутри, остальные вкладки — обычная страница.
  const [tab, setTab] = useState("overview");

  const openTab = (next: string) => {
    setTab(next);
    // Журнал запрашивается при каждом открытии вкладки.
    if (next === "logs") vm.loadLogs();
  };

  return (
    <PageLayout
      fill={tab === "logs"}
      header={
        node && (
          <PageHeader
            title={
              <span className="flex items-center gap-3">
                {node.name}
                <WgNodeStatusBadge status={node.status} />
              </span>
            }
            subtitle={node.publicHost ?? "публичный хост не задан"}
            actions={<NodeHeaderActions vm={vm} node={node} />}
          />
        )
      }
    >
      <PermissionGate permission={WG_PERMISSIONS.NODE_VIEW}>
        {!node ? (
          vm.node.isError ? (
            <PageEmpty icon="error" title="Нода не найдена" />
          ) : (
            <PageLoader label="Загрузка ноды…" />
          )
        ) : (
          <>
            <ProvisionJobBanner
              job={vm.provisionJob}
              nodeStatus={node.status}
            />
            {node.applyError && (
              <Alert
                variant="destructive"
                title="Ошибка применения конфигурации"
              >
                {node.applyError}
              </Alert>
            )}
            <Tabs
              value={tab}
              onValueChange={openTab}
              className={cn(tab === "logs" && "flex min-h-0 flex-1 flex-col")}
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <TabsList>
                  <TabsTrigger value="overview">Обзор</TabsTrigger>
                  <TabsTrigger value="interfaces">Интерфейсы</TabsTrigger>
                  {vm.canManage && (
                    <TabsTrigger value="logs">Журнал агента</TabsTrigger>
                  )}
                </TabsList>
                {tab === "interfaces" && vm.canManageInterfaces && (
                  <Button
                    leftIcon={<Plus size={15} />}
                    onClick={vm.interfaceForm.openCreate}
                  >
                    Новый интерфейс
                  </Button>
                )}
                {tab === "logs" && (
                  <NodeLogsRefreshButton
                    loading={vm.logs.isBusy}
                    onLoad={vm.loadLogs}
                  />
                )}
              </div>
              <TabsContent value="overview" className="pt-4">
                <NodeOverviewTab
                  node={node}
                  live={vm.live}
                  speedPoints={vm.speedPoints}
                  metrics={vm.metrics}
                  isMetricsLoading={vm.isMetricsLoading}
                  links={vm.links}
                />
              </TabsContent>
              <TabsContent value="interfaces" className="pt-4">
                <NodeInterfacesTab
                  interfaces={vm.interfaces.items}
                  isLoading={vm.interfaces.isLoading}
                  canManage={vm.canManageInterfaces}
                  onEdit={vm.interfaceForm.openEdit}
                  onToggle={vm.interfaceActions.toggle}
                  onRestart={vm.interfaceActions.restart}
                  onDelete={vm.interfaceActions.remove}
                  onMove={iface => vm.move.openFor(iface)}
                  onCopy={iface => vm.move.openFor(iface, "copy")}
                  onPin={(iface, pinned) =>
                    void vm.interfaceActions.pinReplica(iface, pinned)
                  }
                  onRemoveReplica={(iface, replicaNodeId) =>
                    void vm.interfaceActions.removeReplica(iface, replicaNodeId)
                  }
                />
              </TabsContent>
              {vm.canManage && (
                <TabsContent
                  value="logs"
                  className="flex min-h-0 flex-1 flex-col pt-4"
                >
                  <NodeLogsTab
                    logs={vm.logs.data}
                    loading={vm.logs.isBusy}
                    error={vm.logs.error?.message ?? null}
                  />
                </TabsContent>
              )}
            </Tabs>
          </>
        )}
      </PermissionGate>
      <WgNodeFormModal vm={vm.nodeForm} />
      <WgInterfaceFormModal vm={vm.interfaceForm} />
      <ProvisionWgNodeModal vm={vm.provision} />
      <MoveWgInterfaceModal vm={vm.move} />
    </PageLayout>
  );
});
