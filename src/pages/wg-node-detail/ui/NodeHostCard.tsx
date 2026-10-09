import { formatBps, type IWgNodeSysMetrics, WgRxTx } from "@entities/wg";
import type { WgNodeDto } from "@shared/api/gen/main/model";
import { Alert, Badge, Card, InfoField } from "@shared/ui";
import { FC } from "react";

interface NodeHostCardProps {
  node: WgNodeDto;
  sys: IWgNodeSysMetrics | null;
}

const formatLoad = (sys: IWgNodeSysMetrics): string =>
  [sys.load1, sys.load5, sys.load15]
    .map(value => (value ?? 0).toFixed(2))
    .join(" / ");

/** Хост ноды: реализация WireGuard, нагрузка, сеть и занятые UDP-порты. */
export const NodeHostCard: FC<NodeHostCardProps> = ({ node, sys }) => {
  const wgMode = node.osInfo?.wgMode;
  const ports = node.osInfo?.udpPorts ?? [];
  const ipMismatch =
    !!node.agentRemoteIp &&
    !!node.publicHost &&
    node.agentRemoteIp !== node.publicHost;

  return (
    <Card title="Хост" description="Данные агента">
      <div className="flex flex-col gap-4">
        {wgMode === "userspace" && (
          <Alert variant="warning" title="WireGuard работает в userspace">
            Модуля ядра нет, интерфейсы обслуживает wireguard-go — отдельный
            процесс в пространстве пользователя: скорость ниже, чем с модулем
            ядра.
          </Alert>
        )}

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <InfoField
            label="WireGuard"
            value={
              wgMode ? (
                <Badge variant={wgMode === "kernel" ? "success" : "warning"}>
                  {wgMode === "kernel" ? "Модуль ядра" : "wireguard-go"}
                </Badge>
              ) : undefined
            }
            emptyText="—"
          />
          <InfoField
            label="Load average (1 / 5 / 15)"
            value={sys ? formatLoad(sys) : undefined}
            emptyText="—"
          />
          <InfoField
            label="Conntrack"
            value={
              sys?.conntrackCount != null && sys.conntrackMax != null
                ? `${sys.conntrackCount} / ${sys.conntrackMax}`
                : undefined
            }
            emptyText="—"
          />
          <InfoField
            label="IP агента"
            value={
              node.agentRemoteIp ? (
                <span className="flex flex-col">
                  <span className="font-mono">{node.agentRemoteIp}</span>
                  {ipMismatch && (
                    <span className="text-xs text-muted-foreground">
                      не совпадает с publicHost {node.publicHost}
                    </span>
                  )}
                </span>
              ) : undefined
            }
            emptyText="—"
          />
        </div>

        {!!sys?.nics?.length && (
          <div className="flex flex-col gap-1.5">
            <p className="text-sm text-muted-foreground">Сетевые интерфейсы</p>
            <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
              {sys.nics.map(nic => (
                <div key={nic.name} className="contents">
                  <span className="font-mono">{nic.name}</span>
                  <WgRxTx
                    inline
                    rx={formatBps(nic.rxBps)}
                    tx={formatBps(nic.txBps)}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {ports.length > 0 && (
          <div className="flex flex-col gap-1.5">
            <p className="text-sm text-muted-foreground">Занятые UDP-порты</p>
            <div className="flex flex-wrap gap-1.5">
              {ports.map(port => (
                <Badge key={port} variant="secondary" className="font-mono">
                  {port}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};
