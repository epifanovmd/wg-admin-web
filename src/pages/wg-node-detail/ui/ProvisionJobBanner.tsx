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

/** Очередь задачи удаления агента по SSH; остальные задачи ноды — установка. */
export const UNINSTALL_QUEUE = "wg.uninstall-node";

const TEXTS = {
  install: {
    active: "Установка агента",
    progress: "Ход установки",
    failed: "Установка агента не удалась",
  },
  uninstall: {
    active: "Удаление агента",
    progress: "Ход удаления",
    failed: "Удаление агента не удалось",
  },
};

/**
 * Ход установки или удаления агента в карточке ноды (обновления задачи — по
 * сокету). Провал установки показывается, пока нода в `error`; провал
 * удаления — пока задача последняя.
 */
export const ProvisionJobBanner: FC<ProvisionJobBannerProps> = ({
  job,
  nodeStatus,
}) => {
  if (!job) return null;

  const uninstall = job.queue === UNINSTALL_QUEUE;
  const texts = uninstall ? TEXTS.uninstall : TEXTS.install;
  const jobLink = (
    <Link to="/jobs" className="underline">
      все задачи
    </Link>
  );

  if (ACTIVE.includes(job.status)) {
    return (
      <Alert variant="info" title={texts.active}>
        <div className="flex flex-col gap-2">
          <Progress value={job.progress} aria-label={texts.progress} />
          <span className="flex gap-2 text-sm">
            <span>{job.progressText ?? "В очереди"}</span>
            {jobLink}
          </span>
        </div>
      </Alert>
    );
  }

  if (FAILED.includes(job.status) && (uninstall || nodeStatus === "error")) {
    return (
      <Alert variant="destructive" title={texts.failed}>
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

  if (
    !uninstall &&
    job.status === "completed" &&
    nodeStatus === "provisioning"
  ) {
    return (
      <Alert variant="info" title="Агент установлен">
        Служба агента запущена, ждём выхода агента на связь.
      </Alert>
    );
  }

  return null;
};
