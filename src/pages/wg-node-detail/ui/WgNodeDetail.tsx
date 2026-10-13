import { AgentAlertsCard } from "@entities/agent";
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
import { AgentTabs, type TAgentTab } from "@widgets/agent-tabs";
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
 * Карточка ноды: шапка с действиями и вкладки обзора, интерфейсов и агента
 * (вкладки агента: обзор, воркеры, настройки, команды, события, журнал — права
 * ноды).
 */
export const WgNodeDetail: FC<WgNodeDetailProps> = observer(({ nodeId }) => {
  const vm = useWgNodeDetailVM(nodeId);
  const node = vm.node.data;
  const [tab, setTab] = useState("overview");
  // Журнал агента — на всю высоту экрана с прокруткой внутри, остальное — страница.
  const [agentTab, setAgentTab] = useState<TAgentTab>("overview");

  const { agent } = vm;

  // Вкладка без права (отозвано на открытой странице) — к обзору.
  const tabAllowed = tab !== "interfaces" || vm.canViewInterfaces;

  useEffect(() => {
    if (!tabAllowed) setTab("overview");
  }, [tabAllowed]);

  return (
    <PageLayout
      fill={tab === "agent" && !!agent && agentTab === "logs"}
      header={
        node && (
          <PageHeader
            title={
              <span className="flex min-w-0 items-center gap-3">
                <span className="truncate">{node.name}</span>
                <span className="inline-flex shrink-0">
                  <WgNodeStatusBadge
                    status={node.status}
                    message={node.statusMessage}
                  />
                </span>
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
              className={cn(
                tab === "agent" &&
                  agentTab === "logs" &&
                  "flex min-h-0 flex-1 flex-col",
              )}
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <TabsList>
                  <TabsTrigger value="overview">Обзор</TabsTrigger>
                  {vm.canViewInterfaces && (
                    <TabsTrigger value="interfaces">Интерфейсы</TabsTrigger>
                  )}
                  <TabsTrigger value="agent">Агент</TabsTrigger>
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
              <TabsContent
                value="agent"
                className="flex min-h-0 flex-1 flex-col gap-4 pt-4"
              >
                {agent ? (
                  <>
                    <AgentAlertsCard alerts={vm.agentAlerts} />
                    <AgentTabs
                      agent={agent}
                      access={vm.agentAccess}
                      value={agentTab}
                      onValueChange={setAgentTab}
                    />
                  </>
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
