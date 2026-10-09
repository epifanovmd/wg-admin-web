import { Tooltip } from "@shared/ui";
import { FC } from "react";

import { workerPendingView } from "../lib/status";
import { StatusViewBadge } from "./StatusViewBadge";

interface WorkerPendingBadgeProps {
  /** `restart` | `update`. */
  pending: string;
}

/** Отложенная замена воркера: ждёт, пока он закончит работу. */
export const WorkerPendingBadge: FC<WorkerPendingBadgeProps> = ({
  pending,
}) => (
  <Tooltip content="Воркер занят: агент заменит его, когда освободится">
    <span className="inline-flex">
      <StatusViewBadge view={workerPendingView(pending)} />
    </span>
  </Tooltip>
);
