import {
  AgentRxTx,
  formatCount,
  formatPercent,
  formatRate,
  formatUsage,
  type IAgentHostMetrics,
  usagePercent,
} from "@entities/agent";
import { StatCard } from "@shared/ui";
import {
  Activity,
  Cpu,
  Gauge,
  HardDrive,
  MemoryStick,
  Network,
  Send,
} from "lucide-react";
import { FC } from "react";

interface AgentStatCardsProps {
  /** Метрики узла по свежей точке; агент их не присылал — `undefined`. */
  host: IAgentHostMetrics | undefined;
  /** Сколько важных сообщений агента ждут подтверждения сервера. */
  outbox: number | undefined;
}

/** Главные показатели узла. */
export const AgentStatCards: FC<AgentStatCardsProps> = ({ host, outbox }) => {
  const memory = usagePercent(host?.memUsedBytes, host?.memTotalBytes);
  const disk = usagePercent(host?.diskUsedBytes, host?.diskTotalBytes);
  const cores = host?.cpuCores.length;

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <StatCard
        title="Процессор"
        value={formatPercent(host?.cpuPercent)}
        description={cores ? `ядер: ${cores}` : undefined}
        icon={<Cpu size={18} />}
        variant={(host?.cpuPercent ?? 0) >= 90 ? "warning" : "default"}
      />
      <StatCard
        title="Память"
        value={formatPercent(memory)}
        description={formatUsage(host?.memUsedBytes, host?.memTotalBytes)}
        icon={<MemoryStick size={18} />}
        variant={(memory ?? 0) >= 90 ? "warning" : "default"}
      />
      <StatCard
        title="Диск /"
        value={formatPercent(disk)}
        description={formatUsage(host?.diskUsedBytes, host?.diskTotalBytes)}
        icon={<HardDrive size={18} />}
        variant={(disk ?? 0) >= 90 ? "warning" : "default"}
      />
      <StatCard
        title="Нагрузка"
        value={host?.load1 == null ? "—" : host.load1.toFixed(2)}
        description={
          host?.load5 == null
            ? "средняя за минуту"
            : `5 мин ${host.load5.toFixed(2)} · 15 мин ${host.load15?.toFixed(2) ?? "—"}`
        }
        icon={<Gauge size={18} />}
      />
      <StatCard
        title="Сеть"
        value={
          host?.netRxBps == null ? (
            "—"
          ) : (
            <AgentRxTx
              rx={formatRate(host.netRxBps)}
              tx={formatRate(host.netTxBps)}
            />
          )
        }
        description={
          host?.netErrors ? `ошибок: ${formatCount(host.netErrors)}` : undefined
        }
        icon={<Network size={18} />}
      />
      <StatCard
        title="Процессы"
        value={formatCount(host?.processes)}
        description={
          host?.threads == null
            ? undefined
            : `потоков: ${formatCount(host.threads)}`
        }
        icon={<Activity size={18} />}
      />
      <StatCard
        title="Ждут отправки"
        value={formatCount(outbox)}
        description="важные сообщения агента"
        icon={<Send size={18} />}
        variant={(outbox ?? 0) > 0 ? "warning" : "default"}
      />
    </div>
  );
};
