import type { WgInterfaceDto } from "@shared/api/gen/main/model";
import { Select } from "@shared/ui";
import { FC } from "react";

import { awaitsAgent, interfaceCopies } from "../model/interface-traffic";

interface InterfaceTrafficSelectProps {
  iface: WgInterfaceDto;
  disabled?: boolean;
  /** Закрепить трафик релея на копии; null — авто. */
  onPin: (iface: WgInterfaceDto, nodeId: string | null) => void;
}

const AUTO = "auto";

/** Какую копию интерфейса обслуживает релей: авто или закреплённую. */
export const InterfaceTrafficSelect: FC<InterfaceTrafficSelectProps> = ({
  iface,
  disabled,
  onPin,
}) => (
  <Select
    size="sm"
    aria-label="Трафик через копию"
    disabled={disabled}
    value={iface.activeReplicaNodeId ?? AUTO}
    onChange={value => onPin(iface, value === AUTO ? null : value)}
    options={[
      { value: AUTO, label: "Авто" },
      ...interfaceCopies(iface).map(copy => {
        const reason = awaitsAgent(copy.nodeStatus)
          ? "ожидает агента"
          : copy.status !== "up"
            ? "не поднята"
            : null;

        return {
          value: copy.nodeId,
          label: reason
            ? `Только ${copy.name} — ${reason}`
            : `Только ${copy.name}`,
          // Закреплённая — единственный путь релея: на неподнятую нельзя.
          disabled: !!reason && iface.activeReplicaNodeId !== copy.nodeId,
        };
      }),
    ]}
    className="w-full max-w-48"
  />
);
