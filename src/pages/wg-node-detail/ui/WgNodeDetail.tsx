import { PermissionGate } from "@entities/user";
import { WG_PERMISSIONS, WgNodeStatusBadge } from "@entities/wg";
import { AssignWgOwnerModal } from "@features/assign-wg-owner";
import {
  MoveWgInterfaceModal,
  WgInterfaceFormModal,
} from "@features/manage-wg-interface";
import {
  ProvisionWgNodeModal,
  WgNodeFormModal,
} from "@features/manage-wg-node";
import { ownPermission } from "@shared/lib/access";
import { cn } from "@shared/lib/utils";
import {
  Alert,
  Button,
  Empty,
  PageEmpty,
  PageHeader,
  PageLayout,
  PageLoader,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@shared/ui";
import {
  WgNodeAgentCard,
  WgNodeConfigsList,
  WgNodeEventsTab,
  WgNodeLogsTab,
  WgNodeWorkersCard,
} from "@widgets/wg-node-agent";
import { Plus } from "lucide-react";
import { observer } from "mobx-react-lite";
import { FC, useEffect, useState } from "react";

import { useWgNodeDetailVM } from "../model/useWgNodeDetailVM";
import { NodeHeaderActions } from "./NodeHeaderActions";
import { NodeInterfacesTab } from "./NodeInterfacesTab";
import { NodeOverviewTab } from "./NodeOverviewTab";
import { ProvisionJobBanner } from "./ProvisionJobBanner";

interface WgNodeDetailProps {
  nodeId: string;
}

/**
 * Карточка ноды: шапка с действиями и вкладки обзора, интерфейсов, агента
 * (связь, воркеры, настройки), событий воркеров и журнала.
 */
export const WgNodeDetail: FC<WgNodeDetailProps> = observer(({ nodeId }) => {
  const vm = useWgNodeDetailVM(nodeId);
  const node = vm.node.data;
  // Журнал — на всю высоту экрана с прокруткой внутри, остальные вкладки — обычная страница.
  const [tab, setTab] = useState("overview");

  const agent = vm.agentContext;

  // Вкладка без права (отозвано на открытой странице) или без агента — к обзору.
  const tabAllowed =
    (tab !== "logs" || (vm.canLogs && !!agent)) &&
    (tab !== "events" || !!agent) &&
    (tab !== "interfaces" || vm.canViewInterfaces);

  useEffect(() => {
    if (!tabAllowed) setTab("overview");
  }, [tabAllowed]);

  return (
    <PageLayout
      fill={tab === "logs"}
      header={
        node && (
          <PageHeader
            title={
              <span className="flex items-center gap-3">
                {node.name}
                <WgNodeStatusBadge
                  status={node.status}
                  message={node.statusMessage}
                />
              </span>
            }
            subtitle={node.publicHost ?? "публичный хост не задан"}
            actions={<NodeHeaderActions vm={vm} node={node} />}
          />
        )
      }
    >
      <PermissionGate permission={ownPermission(WG_PERMISSIONS.NODE_VIEW)}>
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
            {node.statusMessage && node.status === "error" && (
              <Alert variant="destructive" title="Нода не в порядке">
                {node.statusMessage}
              </Alert>
            )}
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
              onValueChange={setTab}
              className={cn(tab === "logs" && "flex min-h-0 flex-1 flex-col")}
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <TabsList>
                  <TabsTrigger value="overview">Обзор</TabsTrigger>
                  {vm.canViewInterfaces && (
                    <TabsTrigger value="interfaces">Интерфейсы</TabsTrigger>
                  )}
                  <TabsTrigger value="agent">Агент</TabsTrigger>
                  {agent && <TabsTrigger value="events">События</TabsTrigger>}
                  {vm.canLogs && agent && (
                    <TabsTrigger value="logs">Журнал</TabsTrigger>
                  )}
                </TabsList>
                {tab === "interfaces" && vm.interfaceAccess.canCreate && (
                  <Button
                    leftIcon={<Plus size={15} />}
                    onClick={vm.interfaceForm.openCreate}
                  >
                    Новый интерфейс
                  </Button>
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
                  nodeId={nodeId}
                  interfaces={vm.interfaces.items}
                  isLoading={vm.interfaces.isLoading}
                  access={vm.interfaceAccess}
                  onEdit={vm.interfaceForm.openEdit}
                  onToggle={vm.interfaceActions.toggle}
                  onRestart={vm.interfaceActions.restart}
                  onDelete={vm.interfaceActions.remove}
                  onMove={iface => vm.move.openFor(iface)}
                  onCopy={iface => vm.move.openFor(iface, "copy")}
                  onRemoveReplica={(iface, replicaNodeId) =>
                    void vm.interfaceActions.removeReplica(iface, replicaNodeId)
                  }
                />
              </TabsContent>
              <TabsContent value="agent" className="pt-4">
                {agent ? (
                  <div className="flex flex-col gap-4">
                    <WgNodeAgentCard context={agent} />
                    <WgNodeWorkersCard context={agent} />
                    <WgNodeConfigsList agent={agent.agent} />
                  </div>
                ) : vm.isAgentLoading ? (
                  <PageLoader label="Загрузка агента…" />
                ) : (
                  <Empty
                    title={
                      node.agentId
                        ? "Агент ноды недоступен"
                        : "Агент не установлен"
                    }
                    description={
                      node.agentId
                        ? "Сведения об агенте не загрузились"
                        : "Установите агента по SSH или командой установки на VPS — он выйдет на связь и привяжется к ноде"
                    }
                  />
                )}
              </TabsContent>
              {agent && (
                <TabsContent value="events" className="pt-4">
                  <WgNodeEventsTab agent={agent.agent} />
                </TabsContent>
              )}
              {vm.canLogs && agent && (
                <TabsContent
                  value="logs"
                  className="flex min-h-0 flex-1 flex-col pt-4"
                >
                  <WgNodeLogsTab nodeId={nodeId} agent={agent.agent} />
                </TabsContent>
              )}
            </Tabs>
          </>
        )}
      </PermissionGate>
      <WgNodeFormModal vm={vm.nodeForm} />
      <WgInterfaceFormModal vm={vm.interfaceForm} />
      <ProvisionWgNodeModal vm={vm.provision} />
      <AssignWgOwnerModal vm={vm.owner} />
      <MoveWgInterfaceModal vm={vm.move} />
    </PageLayout>
  );
});
