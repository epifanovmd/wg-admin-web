import {
  byteAxisDomain,
  formatAxisTime,
  formatChartMoment,
  WG_RX_COLOR,
  WG_TX_COLOR,
} from "@entities/wg";
import { AreaChart } from "@shared/ui";
import { FC } from "react";

import type { IStatsChartRow } from "../model/useWgStatsVM";

interface WgStatsChartProps {
  rows: IStatsChartRow[];
  rx: (row: IStatsChartRow) => number;
  tx: (row: IStatsChartRow) => number;
  format: (value: number) => string;
  loading: boolean;
  ariaLabel: string;
}

/** График выборки: приём и отдача. */
export const WgStatsChart: FC<WgStatsChartProps> = ({
  rows,
  rx,
  tx,
  format,
  loading,
  ariaLabel,
}) => (
  <AreaChart<IStatsChartRow>
    data={rows}
    x={row => new Date(row.ts)}
    xScale="time"
    series={[
      { key: "rx", label: "Приём", value: rx, color: WG_RX_COLOR },
      { key: "tx", label: "Отдача", value: tx, color: WG_TX_COLOR },
    ]}
    height={260}
    curve="monotone"
    grid="y"
    legend="top"
    legendToggle
    formatValue={format}
    formatX={formatChartMoment}
    xAxis={{ tickFormat: value => formatAxisTime(value, true) }}
    yAxis={{
      tickFormat: format,
      tickCount: 5,
      domain: byteAxisDomain(rows.flatMap(row => [rx(row), tx(row)])),
    }}
    loading={loading}
    emptyText="Нет данных за выбранный период"
    ariaLabel={ariaLabel}
  />
);
