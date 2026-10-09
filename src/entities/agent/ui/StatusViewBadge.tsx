import { Badge } from "@shared/ui";
import { FC } from "react";

import type { IStatusView } from "../lib/status";

interface StatusViewBadgeProps {
  view: IStatusView;
  dot?: boolean;
}

/** Бейдж по виду статуса: подпись и окраска. */
export const StatusViewBadge: FC<StatusViewBadgeProps> = ({ view, dot }) => (
  <Badge variant={view.variant} dot={dot}>
    {view.label}
  </Badge>
);
