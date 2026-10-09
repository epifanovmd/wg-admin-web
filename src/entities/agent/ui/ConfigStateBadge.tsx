import { FC } from "react";

import { configStateView } from "../lib/status";
import { StatusViewBadge } from "./StatusViewBadge";

interface ConfigStateBadgeProps {
  /** `pending` | `applying` | `applied` | `failed` | `deleting`. */
  state: string;
}

/** Статус применения ключа настроек воркера. */
export const ConfigStateBadge: FC<ConfigStateBadgeProps> = ({ state }) => (
  <StatusViewBadge view={configStateView(state)} />
);
