import type { EWgNodeStatus } from "@shared/api/gen/main/model";
import { Badge, Tooltip } from "@shared/ui";
import { FC } from "react";

import { NODE_STATUS } from "../lib/status";

interface WgNodeStatusBadgeProps {
  status: EWgNodeStatus;
  /** Пояснение к статусу: что не так с агентом или воркерами — в подсказке. */
  message?: string | null;
}

/** Статус ноды по агенту и воркерам; пояснение — в подсказке. */
export const WgNodeStatusBadge: FC<WgNodeStatusBadgeProps> = ({
  status,
  message,
}) => {
  const view = NODE_STATUS[status];
  const badge = <Badge variant={view.variant}>{view.label}</Badge>;

  return message ? (
    <Tooltip content={message}>
      <span className="inline-flex">{badge}</span>
    </Tooltip>
  ) : (
    badge
  );
};
