import type { IAgentWorkerDto } from "@shared/api/gen/main/model";
import { Tooltip } from "@shared/ui";
import { FC } from "react";

import { workerHealthView } from "../lib/status";
import { StatusViewBadge } from "./StatusViewBadge";

interface WorkerHealthBadgeProps {
  worker: IAgentWorkerDto;
}

/** Самочувствие воркера по `GET /health`; сообщение — в подсказке. Ответа нет — ничего. */
export const WorkerHealthBadge: FC<WorkerHealthBadgeProps> = ({ worker }) => {
  const view = workerHealthView(worker);

  if (!view) return null;

  const badge = <StatusViewBadge view={view} />;
  const message = worker.health?.message;

  return message ? (
    <Tooltip content={message}>
      <span className="inline-flex">{badge}</span>
    </Tooltip>
  ) : (
    badge
  );
};
