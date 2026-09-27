import type { EWgInterfaceStatus } from "@shared/api/gen/main/model";
import { Badge, Tooltip } from "@shared/ui";
import { FC } from "react";

import { INTERFACE_STATUS } from "../lib/status";

interface WgInterfaceStatusBadgeProps {
  status: EWgInterfaceStatus;
  /** Причина ошибки применения (подсказка на бейдже). */
  message?: string | null;
  /** Желаемое состояние: выключенный интерфейс показывается приглушённо. */
  enabled?: boolean;
}

export const WgInterfaceStatusBadge: FC<WgInterfaceStatusBadgeProps> = ({
  status,
  message,
  enabled = true,
}) => {
  const view = enabled
    ? INTERFACE_STATUS[status]
    : ({ label: "Выключен", variant: "muted" } as const);
  const badge = <Badge variant={view.variant}>{view.label}</Badge>;

  return message ? <Tooltip content={message}>{badge}</Tooltip> : badge;
};
