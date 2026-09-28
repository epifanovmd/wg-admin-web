import { WgInterfaceStatusBadge } from "@entities/wg";
import type { WgInterfaceDto } from "@shared/api/gen/main/model";
import { Badge, Tooltip } from "@shared/ui";
import { FC } from "react";

import {
  awaitsAgent,
  interfaceCopies,
  interfaceTraffic,
} from "../model/interface-traffic";

interface InterfaceStatusCompactProps {
  iface: WgInterfaceDto;
}

const copiesLabel = (count: number) =>
  count === 1 ? "1 копия" : count < 5 ? `${count} копии` : `${count} копий`;

/**
 * Статус интерфейса для таблиц: бейдж, число копий (подробности — в
 * подсказке) и явная отметка, когда релей перевёл трафик на копию.
 */
export const InterfaceStatusCompact: FC<InterfaceStatusCompactProps> = ({
  iface,
}) => {
  const replicas = interfaceCopies(iface).filter(copy => !copy.primary);
  const traffic = interfaceTraffic(iface);
  const onReplica =
    traffic?.kind === "relay" &&
    iface.servingNodeId !== null &&
    iface.servingNodeId !== iface.nodeId;

  return (
    <div className="flex flex-wrap items-center gap-1.5 text-xs">
      <WgInterfaceStatusBadge
        status={iface.status}
        message={iface.statusMessage}
        enabled={iface.enabled}
      />
      {replicas.length > 0 && (
        <Tooltip
          content={
            <div className="flex flex-col gap-1">
              {replicas.map(copy => (
                <div key={copy.nodeId} className="flex items-center gap-1.5">
                  <span>{copy.name}</span>
                  {awaitsAgent(copy.nodeStatus) ? (
                    <Badge variant="muted">Ожидает агента</Badge>
                  ) : (
                    <WgInterfaceStatusBadge
                      status={copy.status}
                      message={copy.message}
                      enabled={iface.enabled}
                    />
                  )}
                </div>
              ))}
              <p className="text-muted-foreground">
                {traffic?.kind === "relay"
                  ? `Трафик: релей ${traffic.relayName} → ${traffic.servingName ?? "ждёт отчёта"} · ${traffic.pinned ? "закреплено" : "авто"}`
                  : "Без релея панели — резерв для ручного переноса"}
              </p>
            </div>
          }
        >
          <span className="cursor-default text-muted-foreground underline decoration-dotted underline-offset-2">
            +{copiesLabel(replicas.length)}
          </span>
        </Tooltip>
      )}
      {onReplica && traffic?.kind === "relay" && (
        <Badge variant="warning">трафик → {traffic.servingName}</Badge>
      )}
    </div>
  );
};
