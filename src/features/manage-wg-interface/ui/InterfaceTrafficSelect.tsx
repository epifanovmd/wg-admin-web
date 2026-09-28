import type { WgInterfaceDto } from "@shared/api/gen/main/model";
import { Select } from "@shared/ui";
import { FC } from "react";

import { interfaceCopies } from "../model/interface-traffic";

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
      ...interfaceCopies(iface).map(copy => ({
        value: copy.nodeId,
        label: `Только ${copy.name}`,
      })),
    ]}
    className="w-full max-w-48"
  />
);
