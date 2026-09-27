import {
  formatAxisTime,
  formatBps,
  formatChartMoment,
  formatTraffic,
  type ISpeedPoint,
  type IWgNodeLive,
  WgRxTx,
  WgSpeedChart,
} from "@entities/wg";
import type {
  IWgLinkHealth,
  IWgNodeMetricPointDto,
  WgNodeDto,
} from "@shared/api/gen/main/model";
import { formatBytes, formatDuration } from "@shared/lib/utils";
import { Card, LineChart, StatCard } from "@shared/ui";
import {
  Bot,
  Cpu,
  Database,
  Gauge,
  HardDrive,
  MemoryStick,
  Timer,
  Users,
} from "lucide-react";
import { FC } from "react";

import { NodeHostCard } from "./NodeHostCard";
import { NodeLinksCard } from "./NodeLinksCard";

interface NodeOverviewTabProps {
  node: WgNodeDto;
  live: IWgNodeLive | null;
  speedPoints: ISpeedPoint[];
  metrics: IWgNodeMetricPointDto[];
  isMetricsLoading: boolean;
  links: IWgLinkHealth[];
}

const formatPercent = (value: number): string => `${value.toFixed(0)}%`;

/** Обзор ноды: live-показатели, скорость и системные метрики за сутки. */
export const NodeOverviewTab: FC<NodeOverviewTabProps> = ({
  node,
  live,
  speedPoints,
  metrics,
  isMetricsLoading,
  links,
}) => {
  const sys = live?.sys ?? null;

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          title="Скорость"
          value={
            live ? (
              <WgRxTx rx={formatBps(live.rxBps)} tx={formatBps(live.txBps)} />
            ) : (
              "—"
            )
          }
          icon={<Gauge size={18} />}
        />
        <StatCard
          title="Трафик"
          value={live ? formatTraffic(live.rxTotal + live.txTotal) : "—"}
          description={
            live ? (
              <WgRxTx
                inline
                rx={formatTraffic(live.rxTotal)}
                tx={formatTraffic(live.txTotal)}
              />
            ) : undefined
          }
          icon={<Database size={18} />}
        />
        <StatCard
          title="Пиры онлайн"
          value={live ? `${live.peersOnline} / ${live.peersTotal}` : "—"}
          icon={<Users size={18} />}
        />
        <StatCard
          title="Аптайм"
          value={sys ? formatDuration(sys.uptimeSec) : "—"}
          description={
            node.osInfo?.distro ??
            (node.wgVersion ? `WireGuard: ${node.wgVersion}` : undefined)
          }
          icon={<Timer size={18} />}
        />
      </div>

      <NodeHostCard node={node} sys={sys} transport={live?.transport ?? null} />
      <NodeLinksCard links={links} />

      <Card title="Скорость" description="Обновляется по сокету">
        <WgSpeedChart points={speedPoints} />
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card title="CPU и load average" description="За последние 24 часа">
          <LineChart
            data={metrics}
            x={point => new Date(point.ts)}
            xScale="time"
            series={[
              {
                key: "cpu",
                label: "CPU",
                value: point => point.cpuPercent,
                format: formatPercent,
              },
              { key: "load1", label: "load1", value: point => point.load1 },
            ]}
            height={200}
            grid="y"
            legend="top"
            formatX={formatChartMoment}
            xAxis={{ tickFormat: value => formatAxisTime(value) }}
            loading={isMetricsLoading}
            emptyText="Метрик пока нет"
            ariaLabel="CPU ноды"
          />
        </Card>
        <Card title="Память и диск" description="За последние 24 часа">
          <LineChart
            data={metrics}
            x={point => new Date(point.ts)}
            xScale="time"
            series={[
              {
                key: "mem",
                label: "Память",
                value: point => point.memUsedBytes,
              },
              {
                key: "disk",
                label: "Диск",
                value: point => point.diskUsedBytes,
              },
            ]}
            height={200}
            grid="y"
            legend="top"
            formatValue={formatBytes}
            formatX={formatChartMoment}
            xAxis={{ tickFormat: value => formatAxisTime(value) }}
            yAxis={{ tickFormat: formatBytes, tickCount: 4 }}
            loading={isMetricsLoading}
            emptyText="Метрик пока нет"
            ariaLabel="Память и диск ноды"
          />
        </Card>
      </div>

      {sys && (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard
            title="CPU"
            value={formatPercent(sys.cpuPercent)}
            description={`load1 ${sys.load1.toFixed(2)}`}
            icon={<Cpu size={18} />}
          />
          <StatCard
            title="Память"
            value={formatBytes(sys.memUsedBytes)}
            description={`из ${formatBytes(sys.memTotalBytes)}`}
            icon={<MemoryStick size={18} />}
          />
          <StatCard
            title="Диск"
            value={formatBytes(sys.diskUsedBytes)}
            description={`из ${formatBytes(sys.diskTotalBytes)}`}
            icon={<HardDrive size={18} />}
          />
          <StatCard
            title="Агент"
            value={node.agentVersion ? `v${node.agentVersion}` : "—"}
            description={node.osInfo?.hostname ?? undefined}
            icon={<Bot size={18} />}
          />
        </div>
      )}
    </div>
  );
};
