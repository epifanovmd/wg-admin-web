import {
  AgentLabels,
  formatAgo,
  formatMoment,
  type IAgentHostMetrics,
} from "@entities/agent";
import type { AgentDto } from "@shared/api/gen/main/model";
import { Card, InfoField } from "@shared/ui";
import { FC } from "react";

interface AgentHostCardProps {
  agent: AgentDto;
  host: IAgentHostMetrics | undefined;
}

const GRID_CLASS = "grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4";

/** Длительность в секундах: «3 д 4 ч», «5 ч 12 мин», «40 мин». */
const formatUptime = (seconds: number | undefined): string | undefined => {
  if (seconds === undefined) return undefined;

  const days = Math.floor(seconds / 86_400);
  const hours = Math.floor((seconds % 86_400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (days > 0) return `${days} д ${hours} ч`;
  if (hours > 0) return `${hours} ч ${minutes} мин`;

  return `${minutes} мин`;
};

/**
 * Сведения об агенте и узле, которых нет в шапке: ядро, время работы,
 * подключение, регистрация, метки. Имя узла, ОС, адрес и версия — в шапке.
 */
export const AgentHostCard: FC<AgentHostCardProps> = ({ agent, host }) => (
  <Card title="Агент и узел">
    <div className={GRID_CLASS}>
      <InfoField label="Ядро" value={agent.host?.kernel} />
      <InfoField label="Узел работает" value={formatUptime(host?.uptimeSec)} />
      <InfoField
        label="Агент запущен"
        value={agent.startedAt ? formatAgo(agent.startedAt) : undefined}
      />
      <InfoField
        label="Последняя связь"
        value={formatMoment(agent.lastSeenAt)}
      />
      <InfoField
        label="Зарегистрирован"
        value={formatMoment(agent.enrolledAt)}
      />
      <InfoField
        label="Желаемое"
        value={
          agent.appliedRev === undefined
            ? undefined
            : agent.appliedRev === agent.desiredRev
              ? `применено (версия ${agent.desiredRev})`
              : `применено ${agent.appliedRev} из ${agent.desiredRev}`
        }
        emptyText="агент не сообщал"
      />
      <InfoField
        label="Очередь на узле"
        value={agent.outbox ? `${agent.outbox} не доставлено` : undefined}
        emptyText="пусто"
      />
      <InfoField
        label="Метки"
        truncate={false}
        value={<AgentLabels labels={agent.labels} emptyText="нет" />}
      />
    </div>
  </Card>
);
