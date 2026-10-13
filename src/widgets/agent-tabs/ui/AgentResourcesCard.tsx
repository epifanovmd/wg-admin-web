import {
  AgentRxTx,
  formatCount,
  formatMoment,
  formatPercent,
  formatRate,
  formatUsage,
  type IAgentHostMetrics,
  usagePercent,
} from "@entities/agent";
import { Badge, Card, Progress } from "@shared/ui";
import { FC } from "react";

interface AgentResourcesCardProps {
  host: IAgentHostMetrics | undefined;
  /** Когда собрана точка метрик. */
  metricsAt: number | null;
}

const SUBTITLE_CLASS = "text-sm text-muted-foreground";
const ROW_GRID_CLASS =
  "grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-1 text-sm sm:grid-cols-[minmax(0,10rem)_minmax(0,1fr)_auto]";

/** Диски, сетевые интерфейсы, соединения, температуры и видеокарты узла. */
export const AgentResourcesCard: FC<AgentResourcesCardProps> = ({
  host,
  metricsAt,
}) => {
  const gpus = host?.gpus ?? [];
  const disks = host?.disks ?? [];
  const interfaces = host?.interfaces ?? [];
  const sensors = host?.sensors ?? [];
  const tcp = host?.tcp;
  const limits = [
    tcp?.established != null && `TCP открыто: ${formatCount(tcp.established)}`,
    tcp?.timeWait != null && `закрываются: ${formatCount(tcp.timeWait)}`,
    tcp?.listen != null && `слушают: ${formatCount(tcp.listen)}`,
    host?.conntrack != null &&
      `conntrack: ${formatCount(host.conntrack)} из ${formatCount(host.conntrackMax)}`,
    host?.fdsOpen != null &&
      `открытых файлов: ${formatCount(host.fdsOpen)} из ${formatCount(host.fdsMax)}`,
  ].filter(Boolean);

  if (
    !disks.length &&
    !interfaces.length &&
    !sensors.length &&
    !gpus.length &&
    !limits.length
  ) {
    return null;
  }

  return (
    <Card
      title="Ресурсы узла"
      description={`По точке метрик · ${formatMoment(metricsAt)}`}
    >
      <div className="flex flex-col gap-5">
        {disks.length > 0 && (
          <div className="flex flex-col gap-1.5">
            <p className={SUBTITLE_CLASS}>Диски</p>
            <div className={ROW_GRID_CLASS}>
              {disks.map(disk => {
                const percent = usagePercent(disk.usedBytes, disk.totalBytes);

                return (
                  <div key={disk.mount} className="contents">
                    <span className="truncate font-mono">{disk.mount}</span>
                    <Progress
                      className="hidden sm:block"
                      value={(percent ?? 0) / 100}
                      aria-label={`Диск ${disk.mount}`}
                    />
                    <span className="text-right tabular-nums">
                      {formatPercent(percent)} ·{" "}
                      {formatUsage(disk.usedBytes, disk.totalBytes)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {interfaces.length > 0 && (
          <div className="flex flex-col gap-1.5">
            <p className={SUBTITLE_CLASS}>Сетевые интерфейсы</p>
            <div className="grid grid-cols-[auto_1fr_auto] gap-x-4 gap-y-1 text-sm">
              {interfaces.map(iface => (
                <div key={iface.name} className="contents">
                  <span className="font-mono">{iface.name}</span>
                  <AgentRxTx
                    inline
                    rx={formatRate(iface.rxBps)}
                    tx={formatRate(iface.txBps)}
                  />
                  <span className="text-xs text-muted-foreground">
                    {iface.errors || iface.drops
                      ? `ошибок ${iface.errors ?? 0} · отброшено ${iface.drops ?? 0}`
                      : ""}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {limits.length > 0 && (
          <div className="flex flex-col gap-1.5">
            <p className={SUBTITLE_CLASS}>Соединения и файлы</p>
            <p className="text-sm">{limits.join(" · ")}</p>
          </div>
        )}

        {sensors.length > 0 && (
          <div className="flex flex-col gap-1.5">
            <p className={SUBTITLE_CLASS}>Температура</p>
            <div className="flex flex-wrap gap-1.5">
              {sensors.map(sensor => (
                <Badge
                  key={sensor.name}
                  variant={sensor.c >= 80 ? "warning" : "secondary"}
                >
                  {sensor.name}: {Math.round(sensor.c)} °C
                </Badge>
              ))}
            </div>
          </div>
        )}

        {gpus.length > 0 && (
          <div className="flex flex-col gap-1.5">
            <p className={SUBTITLE_CLASS}>Видеокарты</p>
            <div className="grid grid-cols-1 gap-1 text-sm">
              {gpus.map(gpu => (
                <p key={gpu.index}>
                  <span className="font-medium">
                    {gpu.index}: {gpu.name ?? "видеокарта"}
                  </span>
                  <span className="text-muted-foreground">
                    {[
                      gpu.utilPercent != null &&
                        ` · загрузка ${formatPercent(gpu.utilPercent)}`,
                      gpu.memUsedBytes != null &&
                        ` · память ${formatUsage(gpu.memUsedBytes, gpu.memTotalBytes)}`,
                      gpu.temperatureC != null &&
                        ` · ${Math.round(gpu.temperatureC)} °C`,
                    ]
                      .filter(Boolean)
                      .join("")}
                  </span>
                </p>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};
