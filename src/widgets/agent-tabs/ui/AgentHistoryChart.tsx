import { formatAxisTime, type IHostPoint } from "@entities/agent";
import { Card, type ChartSeries, LineChart } from "@shared/ui";
import { FC } from "react";

interface AgentHistoryChartProps {
  title: string;
  points: IHostPoint[];
  series: ChartSeries<IHostPoint>[];
  format: (value: number) => string;
  isLoading: boolean;
  /** Подписи оси с датой (период больше суток). */
  withDate: boolean;
  domain?: [number, number];
}

const formatMoment = (value: Date | number | string): string =>
  new Date(value).toLocaleString("ru-RU");

/** График истории метрик за период. */
export const AgentHistoryChart: FC<AgentHistoryChartProps> = ({
  title,
  points,
  series,
  format,
  isLoading,
  withDate,
  domain,
}) => (
  <Card title={title}>
    <LineChart
      data={points}
      x={point => new Date(point.at)}
      xScale="time"
      series={series}
      height={200}
      grid="y"
      legend={series.length > 1 ? "top" : false}
      formatValue={format}
      formatX={formatMoment}
      xAxis={{ tickFormat: value => formatAxisTime(value, withDate) }}
      yAxis={{ tickFormat: format, tickCount: 4, domain }}
      loading={isLoading}
      emptyText="Метрик за этот период нет"
      ariaLabel={title}
    />
  </Card>
);
