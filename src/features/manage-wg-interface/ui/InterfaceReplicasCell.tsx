import { WgInterfaceStatusBadge } from "@entities/wg";
import type { EWgNodeStatus } from "@shared/api/gen/main/model";
import type { WgInterfaceDto } from "@shared/api/gen/main/model";
import { Badge, IconButton, Select, Tooltip } from "@shared/ui";
import { Radio, X } from "lucide-react";
import { FC } from "react";

interface InterfaceReplicasCellProps {
  iface: WgInterfaceDto;
  /** Снимать копии и закреплять обслуживающую (право на реплики). */
  canManageReplicas: boolean;
  /** Закрепить трафик через релей на копии; null — авто. */
  onPin: (iface: WgInterfaceDto, nodeId: string | null) => void;
  onRemoveReplica: (iface: WgInterfaceDto, nodeId: string) => void;
}

const AUTO = "auto";

/** Агента на ноде копии ещё нет: интерфейс там не поднят и статуса нет. */
const awaitsAgent = (status: EWgNodeStatus | null | undefined) =>
  status === "created" || status === "provisioning";

/**
 * Копии интерфейса (основная и реплики) со статусами, отметкой копии, через
 * которую релей сейчас шлёт трафик, и ручным закреплением.
 */
export const InterfaceReplicasCell: FC<InterfaceReplicasCellProps> = ({
  iface,
  canManageReplicas,
  onPin,
  onRemoveReplica,
}) => {
  const copies = [
    {
      nodeId: iface.nodeId,
      name: iface.nodeName ?? "основная",
      status: iface.status,
      message: iface.statusMessage,
      nodeStatus: iface.nodeStatus,
      primary: true,
    },
    ...iface.replicas.map(replica => ({
      nodeId: replica.nodeId,
      name: replica.nodeName ?? replica.nodeId.slice(0, 8),
      status: replica.status,
      message: replica.statusMessage,
      nodeStatus: replica.nodeStatus,
      primary: false,
    })),
  ];
  const hasReplicas = iface.replicas.length > 0;

  return (
    <div className="flex min-w-0 flex-col gap-1.5 text-xs">
      {copies.map(copy => (
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
          {!copy.primary && canManageReplicas && (
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

      {hasReplicas && iface.endpointId && (
        <Select
          size="sm"
          aria-label="Трафик через копию"
          disabled={!canManageReplicas}
          value={iface.activeReplicaNodeId ?? AUTO}
          onChange={value => onPin(iface, value === AUTO ? null : value)}
          options={[
            { value: AUTO, label: "Трафик: авто (живая по приоритету)" },
            ...copies.map(copy => ({
              value: copy.nodeId,
              label: `Трафик: только ${copy.name}`,
            })),
          ]}
          className="w-full max-w-64"
        />
      )}
    </div>
  );
};
