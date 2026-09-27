import { AreaChart } from "@shared/ui";
import { FC } from "react";

import { WG_RX_COLOR, WG_TX_COLOR } from "../lib/colors";
import { byteAxisDomain, formatBps, formatChartTime } from "../lib/format";
import type { ISpeedPoint } from "../model/live.types";

interface WgSpeedChartProps {
  points: ISpeedPoint[];
  height?: number;
  loading?: boolean;
}

/** Live-график скорости (приём/отдача) по точкам из сокета. */
export const WgSpeedChart: FC<WgSpeedChartProps> = ({
  points,
  height = 220,
  loading,
}) => (
  <AreaChart
    data={points}
    x={point => new Date(point.ts)}
    xScale="time"
    series={[
      {
        key: "rx",
        label: "Приём",
        value: point => point.rxBps,
        color: WG_RX_COLOR,
      },
      {
        key: "tx",
        label: "Отдача",
        value: point => point.txBps,
        color: WG_TX_COLOR,
      },
    ]}
    height={height}
    curve="monotone"
    grid="y"
    legend="top"
    formatValue={formatBps}
    formatX={formatChartTime}
    xAxis={{ tickFormat: formatChartTime }}
    yAxis={{
      tickFormat: formatBps,
      tickCount: 4,
      domain: byteAxisDomain(
        points.flatMap(point => [point.rxBps, point.txBps]),
      ),
    }}
    loading={loading}
    emptyText="Ждём данные от агента…"
    ariaLabel="Скорость трафика"
  />
);
