import { Tooltip } from "@shared/ui";
import { FC } from "react";

import { workerStateView } from "../lib/status";
import { StatusViewBadge } from "./StatusViewBadge";

interface WorkerStateBadgeProps {
  state: string;
  /** Причина состояния (у `invalid` — что не так с `/health` или `/manifest`). */
  message?: string;
}

/** Состояние воркера у агента; причина — в подсказке. */
export const WorkerStateBadge: FC<WorkerStateBadgeProps> = ({
  state,
  message,
}) => {
  const badge = <StatusViewBadge view={workerStateView(state)} />;

  return message ? (
    <Tooltip content={message}>
      <span className="inline-flex">{badge}</span>
    </Tooltip>
  ) : (
    badge
  );
};
