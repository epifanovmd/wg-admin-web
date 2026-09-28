import { WgInterfaceStatusBadge } from "@entities/wg";
import type { WgInterfaceDto } from "@shared/api/gen/main/model";
import { Badge, IconButton, Tooltip } from "@shared/ui";
import { Radio, X } from "lucide-react";
import { FC } from "react";

import { awaitsAgent, interfaceCopies } from "../model/interface-traffic";
import { InterfaceTrafficNote } from "./InterfaceTrafficNote";

interface InterfaceReplicasCellProps {
  iface: WgInterfaceDto;
  /** Снимать копии (право на реплики); без обработчика — только просмотр. */
  canManageReplicas: boolean;
  onRemoveReplica?: (iface: WgInterfaceDto, nodeId: string) => void;
  /** Строка «куда идёт трафик» под копиями. */
  showTraffic?: boolean;
}

/**
 * Копии интерфейса (основная и реплики) со статусами и отметкой копии, через
 * которую релей сейчас шлёт трафик. Выбор копии — у релея (пробросы).
 */
export const InterfaceReplicasCell: FC<InterfaceReplicasCellProps> = ({
  iface,
  canManageReplicas,
  onRemoveReplica,
  showTraffic = true,
}) => {
  const hasReplicas = iface.replicas.length > 0;

  return (
    <div className="flex min-w-0 flex-col gap-1.5 text-xs">
      {interfaceCopies(iface).map(copy => (
        <div key={copy.nodeId} className="flex items-center gap-1.5">
          {iface.servingNodeId === copy.nodeId && hasReplicas ? (
            <Tooltip content="Трафик через релей идёт сюда">
              <Radio
                size={13}
                className="shrink-0 text-success"
                aria-label={`Трафик идёт через ${copy.name}`}
              />
            </Tooltip>
          ) : (
            <span className="inline-block w-[13px] shrink-0" />
          )}
          <span className="truncate">{copy.name}</span>
          {copy.primary && hasReplicas && (
            <span className="text-muted-foreground">· основная</span>
          )}
          {awaitsAgent(copy.nodeStatus) ? (
            <Tooltip content="Копия поднимется, когда на ноде будет установлен агент">
              <Badge variant="muted">Ожидает агента</Badge>
            </Tooltip>
          ) : (
            <WgInterfaceStatusBadge
              status={copy.status}
              message={copy.message}
              enabled={iface.enabled}
            />
          )}
          {!copy.primary && canManageReplicas && onRemoveReplica && (
            <Tooltip content="Убрать копию">
              <IconButton
                size="sm"
                variant="ghost"
                aria-label={`Убрать копию ${copy.name}`}
                onClick={() => onRemoveReplica(iface, copy.nodeId)}
              >
                <X size={13} />
              </IconButton>
            </Tooltip>
          )}
        </div>
      ))}

      {showTraffic && <InterfaceTrafficNote iface={iface} />}
    </div>
  );
};
