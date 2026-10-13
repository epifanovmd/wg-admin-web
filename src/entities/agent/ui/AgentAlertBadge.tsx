import { FC } from "react";

import { agentAlertView } from "../lib/status";
import { StatusViewBadge } from "./StatusViewBadge";

interface AgentAlertBadgeProps {
  /** `offline` | `workerDown` | `workerInvalid` | `workerUnhealthy` | `configFailed`. */
  type: string;
}

/** Вид проблемы агента. */
export const AgentAlertBadge: FC<AgentAlertBadgeProps> = ({ type }) => (
  <StatusViewBadge view={agentAlertView(type)} />
);
