import type { EWgNodeStatus, JobRunDto } from "@shared/api/gen/main/model";
import { Alert, Progress } from "@shared/ui";
import { Link } from "@tanstack/react-router";
import { FC } from "react";

interface ProvisionJobBannerProps {
  job: JobRunDto | null;
  nodeStatus: EWgNodeStatus;
}

const ACTIVE = ["queued", "running"];
const FAILED = ["failed", "cancelled"];

/** Ход установки агента в карточке ноды (обновления задачи — по сокету). */
export const ProvisionJobBanner: FC<ProvisionJobBannerProps> = ({
  job,
  nodeStatus,
}) => {
  if (!job) return null;

  const jobLink = (
    <Link to="/jobs" className="underline">
      все задачи
    </Link>
  );

  if (ACTIVE.includes(job.status)) {
    return (
      <Alert variant="info" title="Установка агента">
        <div className="flex flex-col gap-2">
          <Progress value={job.progress} aria-label="Ход установки" />
          <span className="flex gap-2 text-sm">
            <span>{job.progressText ?? "В очереди"}</span>
            {jobLink}
          </span>
        </div>
      </Alert>
    );
  }

  if (FAILED.includes(job.status) && nodeStatus === "error") {
    return (
      <Alert variant="destructive" title="Установка агента не удалась">
        <div className="flex flex-col gap-2 text-sm">
          <span>{job.error?.message ?? "Задача отменена"}</span>
          {job.logTail.length > 0 && (
            <pre className="max-h-32 overflow-auto rounded bg-muted p-2 text-xs">
              {job.logTail.slice(-8).join("\n")}
            </pre>
          )}
          <span>{jobLink}</span>
        </div>
      </Alert>
    );
  }

  if (job.status === "completed" && nodeStatus === "provisioning") {
    return (
      <Alert variant="info" title="Агент установлен">
        Служба агента запущена, ждём выхода агента на связь.
      </Alert>
    );
  }

  return null;
};
