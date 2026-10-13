import {
  AGENT_RX_COLOR,
  AGENT_TX_COLOR,
  byteAxisDomain,
  formatClock,
  formatPercent,
  formatRate,
  formatSize,
  hostPoints,
  type IHostPoint,
} from "@entities/agent";
import type { IAgentMetricsPointDto } from "@shared/api/gen/main/model";
import { AreaChart, Card } from "@shared/ui";
import { FC, useMemo } from "react";

interface AgentLiveChartsProps {
  points: IAgentMetricsPointDto[];
  isLoading: boolean;
  online: boolean;
}

const HEIGHT = 180;

const at = (point: IHostPoint) => new Date(point.at);

/** Живые графики процессора, памяти и сети за последние минуты. */
export const AgentLiveCharts: FC<AgentLiveChartsProps> = ({
  points,
  isLoading,
  online,
}) => {
  const data = useMemo(() => hostPoints(points), [points]);
  const memTotal = data.at(-1)?.host?.memTotalBytes;
  const emptyText = online ? "Ждём данные от агента…" : "Агент без связи";
  const description = online
    ? "Раз в секунду, последние 5 минут"
    : "Последние 5 минут";

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <Card title="Процессор" description={description}>
        <AreaChart
          data={data}
          x={at}
          xScale="time"
          series={[
            {
              key: "cpu",
              label: "Загрузка",
              value: point => point.host?.cpuPercent,
            },
          ]}
          height={HEIGHT}
          curve="monotone"
          grid="y"
          formatValue={formatPercent}
          formatX={formatClock}
          xAxis={{ tickFormat: formatClock, tickCount: 3 }}
          yAxis={{ tickFormat: formatPercent, tickCount: 4, domain: [0, 100] }}
          loading={isLoading}
          emptyText={emptyText}
          ariaLabel="Загрузка процессора"
        />
      </Card>
      <Card title="Память" description={description}>
        <AreaChart
          data={data}
          x={at}
          xScale="time"
          series={[
            {
              key: "mem",
              label: "Занято",
              value: point => point.host?.memUsedBytes,
            },
          ]}
          height={HEIGHT}
          curve="monotone"
          grid="y"
          formatValue={formatSize}
          formatX={formatClock}
          xAxis={{ tickFormat: formatClock, tickCount: 3 }}
          yAxis={{
            tickFormat: formatSize,
            tickCount: 4,
            domain: memTotal ? [0, memTotal] : undefined,
          }}
          loading={isLoading}
          emptyText={emptyText}
          ariaLabel="Занятая память"
        />
      </Card>
      <Card title="Сеть" description={description}>
        <AreaChart
          data={data}
          x={at}
          xScale="time"
          series={[
            {
              key: "rx",
              label: "Приём",
              value: point => point.host?.netRxBps,
              color: AGENT_RX_COLOR,
            },
            {
              key: "tx",
              label: "Отдача",
              value: point => point.host?.netTxBps,
              color: AGENT_TX_COLOR,
            },
          ]}
          height={HEIGHT}
          curve="monotone"
          grid="y"
          legend="top"
          formatValue={formatRate}
          formatX={formatClock}
          xAxis={{ tickFormat: formatClock, tickCount: 3 }}
          yAxis={{
            tickFormat: formatRate,
            tickCount: 4,
            domain: byteAxisDomain(
              data.flatMap(point => [
                point.host?.netRxBps ?? 0,
                point.host?.netTxBps ?? 0,
              ]),
            ),
          }}
          loading={isLoading}
          emptyText={emptyText}
          ariaLabel="Скорость сети"
        />
      </Card>
    </div>
  );
};
