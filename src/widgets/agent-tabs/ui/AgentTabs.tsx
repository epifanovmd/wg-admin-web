import { WorkerCommandConsole } from "@features/send-worker-command";
import type { AgentDto } from "@shared/api/gen/main/model";
import { cn } from "@shared/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@shared/ui";
import { observer } from "mobx-react-lite";
import { FC } from "react";

import { isAgentTab, type TAgentTab } from "../model/tabs";
import type { IAgentTabsAccess } from "../model/types";
import { AgentConfigsTab } from "./AgentConfigsTab";
import { AgentEventsTab } from "./AgentEventsTab";
import { AgentLogsTab } from "./AgentLogsTab";
import { AgentOverviewTab } from "./AgentOverviewTab";
import { AgentWorkersTab } from "./AgentWorkersTab";

interface AgentTabsProps {
  agent: AgentDto;
  access: IAgentTabsAccess;
  /** Открытая вкладка: журнал страница растягивает на всю высоту. */
  value: TAgentTab;
  onValueChange: (tab: TAgentTab) => void;
}

const TAB_CONTENT_CLASS = "pt-4";

/**
 * Вкладки агента: обзор, воркеры, настройки, команды воркерам (с правом),
 * события и журнал.
 */
export const AgentTabs: FC<AgentTabsProps> = observer(
  ({ agent, access, value, onValueChange }) => {
    // Без права на команды вкладки нет — открытая сбрасывается на обзор.
    const tab = value === "commands" && !access.canCommand ? "overview" : value;

    return (
      <Tabs
        value={tab}
        onValueChange={next => {
          if (isAgentTab(next)) onValueChange(next);
        }}
        className={cn(tab === "logs" && "flex min-h-0 flex-1 flex-col")}
      >
        <TabsList>
          <TabsTrigger value="overview">Обзор</TabsTrigger>
          <TabsTrigger value="workers">Воркеры</TabsTrigger>
          <TabsTrigger value="configs">Настройки</TabsTrigger>
          {access.canCommand && (
            <TabsTrigger value="commands">Команды</TabsTrigger>
          )}
          <TabsTrigger value="events">События</TabsTrigger>
          <TabsTrigger value="logs">Журнал</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className={TAB_CONTENT_CLASS}>
          <AgentOverviewTab agent={agent} />
        </TabsContent>
        <TabsContent value="workers" className={TAB_CONTENT_CLASS}>
          <AgentWorkersTab agent={agent} canManage={access.canManage} />
        </TabsContent>
        <TabsContent value="configs" className={TAB_CONTENT_CLASS}>
          <AgentConfigsTab agent={agent} canConfig={access.canConfig} />
        </TabsContent>
        {access.canCommand && (
          <TabsContent value="commands" className={TAB_CONTENT_CLASS}>
            <WorkerCommandConsole agent={agent} />
          </TabsContent>
        )}
        <TabsContent value="events" className={TAB_CONTENT_CLASS}>
          <AgentEventsTab agent={agent} />
        </TabsContent>
        <TabsContent value="logs" className="flex min-h-0 flex-1 flex-col pt-4">
          <AgentLogsTab agent={agent} canLogs={access.canLogs} />
        </TabsContent>
      </Tabs>
    );
  },
);
