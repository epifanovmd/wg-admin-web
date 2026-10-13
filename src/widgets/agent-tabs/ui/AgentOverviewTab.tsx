import type { AgentDto } from "@shared/api/gen/main/model";
import { observer } from "mobx-react-lite";
import { FC } from "react";

import { useAgentOverviewVM } from "../model/useAgentOverviewVM";
import { AgentHistoryCharts } from "./AgentHistoryCharts";
import { AgentHostCard } from "./AgentHostCard";
import { AgentLiveCharts } from "./AgentLiveCharts";
import { AgentResourcesCard } from "./AgentResourcesCard";
import { AgentStatCards } from "./AgentStatCards";

interface AgentOverviewTabProps {
  agent: AgentDto;
}

/** Обзор: главные показатели узла, живые графики, сведения, ресурсы и история. */
export const AgentOverviewTab: FC<AgentOverviewTabProps> = observer(
  ({ agent }) => {
    const { live, history, host, metricsAt } = useAgentOverviewVM(agent);

    return (
      <div className="flex flex-col gap-4">
        <AgentStatCards host={host} outbox={agent.outbox} />
        <AgentLiveCharts
          points={live.points}
          isLoading={live.isLoading}
          online={agent.online && !agent.revoked}
        />
        <AgentHostCard agent={agent} host={host} />
        <AgentResourcesCard host={host} metricsAt={metricsAt} />
        <AgentHistoryCharts
          points={history.points}
          isLoading={history.isLoading}
          withDate={history.withDate}
          period={history.period}
          periods={history.periods}
          onPeriodChange={history.setPeriod}
        />
      </div>
    );
  },
);
