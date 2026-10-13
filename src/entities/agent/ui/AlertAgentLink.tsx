import { Link } from "@tanstack/react-router";
import { FC } from "react";

import type { IAgentAlert } from "../model/types";

interface AlertAgentLinkProps {
  alert: IAgentAlert;
}

/** Агент проблемы — ссылкой на его страницу. */
export const AlertAgentLink: FC<AlertAgentLinkProps> = ({ alert }) => (
  <Link
    to="/agents/$agentId"
    params={{ agentId: alert.agentId }}
    className="font-medium hover:underline"
  >
    {alert.agentName}
  </Link>
);
