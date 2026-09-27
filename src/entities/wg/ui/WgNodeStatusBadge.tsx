import type { EWgNodeStatus } from "@shared/api/gen/main/model";
import { Badge } from "@shared/ui";
import { FC } from "react";

import { NODE_STATUS } from "../lib/status";

interface WgNodeStatusBadgeProps {
  status: EWgNodeStatus;
}

export const WgNodeStatusBadge: FC<WgNodeStatusBadgeProps> = ({ status }) => {
  const view = NODE_STATUS[status];

  return <Badge variant={view.variant}>{view.label}</Badge>;
};
