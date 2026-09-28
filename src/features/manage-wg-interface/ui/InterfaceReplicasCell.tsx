import { WgInterfaceStatusBadge } from "@entities/wg";
import type { WgInterfaceDto } from "@shared/api/gen/main/model";
import { cn } from "@shared/lib/utils";
import { Badge, IconButton, Tooltip } from "@shared/ui";
import { Radio, Trash2 } from "lucide-react";
import { FC } from "react";

import { awaitsAgent, interfaceCopies } from "../model/interface-traffic";

interface InterfaceReplicasCellProps {
  iface: WgInterfaceDto;
  /** Снимать копии (право на реплики); без обработчика — только просмотр. */
  canManageReplicas: boolean;
  onRemoveReplica?: (iface: WgInterfaceDto, nodeId: string) => void;
  /** Плотно, без разделителей — для ячейки таблицы. */
  dense?: boolean;
}

/**
 * Копии интерфейса (основная и реплики): нода, роль, статус и отметка копии,
 * на которую релей сейчас шлёт трафик. Выбор копии — у релея (пробросы).
 */
export const InterfaceReplicasCell: FC<InterfaceReplicasCellProps> = ({
  iface,
  canManageReplicas,
  onRemoveReplica,
  dense = false,
}) => {
  const hasReplicas = iface.replicas.length > 0;
  const removable = canManageReplicas && !!onRemoveReplica;

  return (
    <ul
      className={cn(
        "flex min-w-0 flex-col text-sm",
        dense ? "gap-1 text-xs" : "divide-y divide-border",
      )}
    >
      {interfaceCopies(iface).map(copy => {
        const serving = hasReplicas && iface.servingNodeId === copy.nodeId;

        return (
          <li
            key={copy.nodeId}
            className={cn("flex items-center gap-3", !dense && "py-2.5")}
          >
            <div className="flex min-w-0 flex-1 items-center gap-2">
              {serving ? (
                <Tooltip content="Релей шлёт трафик сюда">
                  <Radio
                    size={14}
                    className="shrink-0 text-success"
                    aria-label={`Трафик идёт через ${copy.name}`}
                  />
                </Tooltip>
              ) : (
                <span className="inline-block w-[14px] shrink-0" />
              )}
              <span className="truncate font-medium">{copy.name}</span>
              <span className="shrink-0 text-xs text-muted-foreground">
                {copy.primary ? "основная" : "копия"}
              </span>
            </div>
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
            {removable &&
              (copy.primary ? (
                <span className="inline-block w-8 shrink-0" />
              ) : (
                <Tooltip content="Убрать копию">
                  <IconButton
                    size="sm"
                    variant="ghost"
                    className="shrink-0 text-muted-foreground hover:text-destructive"
                    aria-label={`Убрать копию ${copy.name}`}
                    onClick={() => onRemoveReplica(iface, copy.nodeId)}
                  >
                    <Trash2 size={14} />
                  </IconButton>
                </Tooltip>
              ))}
          </li>
        );
      })}
    </ul>
  );
};
