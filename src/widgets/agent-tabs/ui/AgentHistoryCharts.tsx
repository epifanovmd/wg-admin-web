import {
  AGENT_RX_COLOR,
  AGENT_TX_COLOR,
  formatCount,
  formatPercent,
  formatRate,
  formatSize,
  hasHostMetric,
  hostPoints,
  type IHostPoint,
  type IMetricsPeriod,
} from "@entities/agent";
import type { IAgentMetricsPointDto } from "@shared/api/gen/main/model";
import { Segmented } from "@shared/ui";
import { FC, useMemo } from "react";

import { AgentHistoryChart } from "./AgentHistoryChart";

interface AgentHistoryChartsProps {
  points: IAgentMetricsPointDto[];
  isLoading: boolean;
  withDate: boolean;
  period: IMetricsPeriod["value"];
  periods: IMetricsPeriod[];
  onPeriodChange: (period: IMetricsPeriod["value"]) => void;
}

const formatLoadValue = (value: number): string => value.toFixed(2);
const formatCelsius = (value: number): string => `${Math.round(value)} °C`;

/** История метрик за период: графики только для того, что присылает агент. */
export const AgentHistoryCharts: FC<AgentHistoryChartsProps> = ({
  points,
  isLoading,
  withDate,
  period,
  periods,
  onPeriodChange,
}) => {
  const data = useMemo(() => hostPoints(points), [points]);
  const common = { points: data, isLoading, withDate };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-base font-semibold">История</h2>
        <Segmented
          value={period}
          onValueChange={onPeriodChange}
          options={periods.map(({ value, label }) => ({ value, label }))}
        />
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <AgentHistoryChart
          {...common}
          title="Процессор"
          format={formatPercent}
          domain={[0, 100]}
          series={[
            {
              key: "cpu",
              label: "Загрузка",
              value: point => point.host?.cpuPercent,
            },
          ]}
        />
        <AgentHistoryChart
          {...common}
          title="Память"
          format={formatSize}
          series={[
            {
              key: "mem",
              label: "Память",
              value: point => point.host?.memUsedBytes,
            },
            ...(hasHostMetric(data, host => host.swapUsedBytes)
              ? [
                  {
                    key: "swap",
                    label: "Подкачка",
                    value: (point: IHostPoint) => point.host?.swapUsedBytes,
                  },
                ]
              : []),
          ]}
        />
        <AgentHistoryChart
          {...common}
          title="Сеть"
          format={formatRate}
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
        />
        {hasHostMetric(data, host => host.load1) && (
          <AgentHistoryChart
            {...common}
            title="Средняя нагрузка"
            format={formatLoadValue}
            series={[
              {
                key: "load1",
                label: "1 мин",
                value: point => point.host?.load1,
              },
              {
                key: "load5",
                label: "5 мин",
                value: point => point.host?.load5,
              },
              {
                key: "load15",
                label: "15 мин",
                value: point => point.host?.load15,
              },
            ]}
          />
        )}
        {hasHostMetric(data, host => host.diskUsedBytes) && (
          <AgentHistoryChart
            {...common}
            title="Диск /"
            format={formatSize}
            series={[
              {
                key: "disk",
                label: "Занято",
                value: point => point.host?.diskUsedBytes,
              },
            ]}
          />
        )}
        {hasHostMetric(data, host => host.diskReadBps ?? host.diskWriteBps) && (
          <AgentHistoryChart
            {...common}
            title="Диск: чтение и запись"
            format={formatRate}
            series={[
              {
                key: "read",
                label: "Чтение",
                value: point => point.host?.diskReadBps,
              },
              {
                key: "write",
                label: "Запись",
                value: point => point.host?.diskWriteBps,
              },
            ]}
          />
        )}
        {hasHostMetric(data, host => host.tcp?.established) && (
          <AgentHistoryChart
            {...common}
            title="TCP-соединения"
            format={formatCount}
            series={[
              {
                key: "established",
                label: "Открыты",
                value: point => point.host?.tcp?.established,
              },
              {
                key: "timeWait",
                label: "Закрываются",
                value: point => point.host?.tcp?.timeWait,
              },
            ]}
          />
        )}
        {hasHostMetric(data, host => host.temperatureMaxC) && (
          <AgentHistoryChart
            {...common}
            title="Температура"
            format={formatCelsius}
            series={[
              {
                key: "temp",
                label: "Самый горячий датчик",
                value: point => point.host?.temperatureMaxC,
              },
            ]}
          />
        )}
      </div>
    </div>
  );
};
