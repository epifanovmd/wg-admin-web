import type { EJobRunStatus } from "@shared/api/gen/main/model";
import type { BadgeProps } from "@shared/ui";
import { Badge } from "@shared/ui";
import { FC } from "react";

const META: Record<
  EJobRunStatus,
  {
    label: string;
    variant: NonNullable<BadgeProps["variant"]>;
  }
> = {
  queued: { label: "в очереди", variant: "muted" },
  running: { label: "выполняется", variant: "info" },
  completed: { label: "готово", variant: "success" },
  failed: { label: "ошибка", variant: "destructive" },
  cancelled: { label: "отменена", variant: "warning" },
};

interface JobStatusBadgeProps {
  status: EJobRunStatus;
}

export const JobStatusBadge: FC<JobStatusBadgeProps> = ({ status }) => (
  <Badge variant={META[status].variant}>{META[status].label}</Badge>
);
