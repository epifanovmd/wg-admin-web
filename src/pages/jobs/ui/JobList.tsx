import { isJobActive, jobErrorText, JobStatusBadge } from "@entities/job";
import type { JobRunDto } from "@shared/api/gen/main/model";
import { formatter } from "@shared/lib/utils";
import { Button, Empty, Progress, Skeleton } from "@shared/ui";
import { FC } from "react";

interface JobListProps {
  jobs: JobRunDto[];
  isLoading: boolean;
  cancellingId: string | null;
  onCancel: (id: string) => void;
}

const resultText = (job: JobRunDto): string | null =>
  job.result == null ? null : JSON.stringify(job.result);

const JobRow: FC<{
  job: JobRunDto;
  cancelling: boolean;
  onCancel: (id: string) => void;
}> = ({ job, cancelling, onCancel }) => {
  const active = isJobActive(job);
  const error = jobErrorText(job);
  const result = resultText(job);

  return (
    <li className="flex flex-col gap-2 py-3 first:pt-0 last:pb-0">
      <div className="flex items-center gap-3">
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-2 truncate text-sm font-medium text-foreground">
            {job.title}
            <JobStatusBadge status={job.status} />
          </p>
          <p className="truncate text-xs text-muted-foreground">
            {job.queue} · {formatter.date.format(job.createdAt)}
            {job.attempt > 1 && ` · попытка ${job.attempt}`}
          </p>
        </div>
        {active && (
          <Button
            size="sm"
            variant="outline"
            loading={cancelling}
            disabled={job.cancelRequested}
            onClick={() => onCancel(job.id)}
          >
            {job.cancelRequested ? "Отменяется…" : "Отменить"}
          </Button>
        )}
      </div>
      {active && (
        <div className="flex items-center gap-3">
          <Progress
            className="flex-1"
            value={job.progress}
            indeterminate={job.status === "queued"}
          />
          <span className="w-10 text-right text-xs tabular-nums text-muted-foreground">
            {Math.round(job.progress * 100)}%
          </span>
        </div>
      )}
      {active && job.progressText && (
        <p className="text-xs text-muted-foreground">{job.progressText}</p>
      )}
      {error && <p className="text-xs text-destructive">{error}</p>}
      {result && (
        <code className="truncate rounded bg-muted px-2 py-1 text-xs">
          {result}
        </code>
      )}
    </li>
  );
};

export const JobList: FC<JobListProps> = ({
  jobs,
  isLoading,
  cancellingId,
  onCancel,
}) => {
  if (isLoading && jobs.length === 0)
    return <Skeleton className="h-24 w-full" />;
  if (jobs.length === 0) {
    return (
      <Empty
        title="Задач пока нет"
        description="Здесь появятся установки и удаления агентов на нодах — с прогрессом в реальном времени."
      />
    );
  }

  return (
    <ul className="flex flex-col divide-y divide-border">
      {jobs.map(job => (
        <JobRow
          key={job.id}
          job={job}
          cancelling={cancellingId === job.id}
          onCancel={onCancel}
        />
      ))}
    </ul>
  );
};
