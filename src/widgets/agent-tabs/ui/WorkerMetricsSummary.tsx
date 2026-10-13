import { formatJson, numericFields, readNumber } from "@entities/agent";
import { Collapse } from "@shared/ui";
import { FC } from "react";

interface WorkerMetricsSummaryProps {
  /** Ответ `GET /metrics` воркера из последней точки. */
  metrics: unknown;
}

/** Числовых показателей в строку — не больше. */
const MAX_FIELDS = 12;

const formatNumber = (value: number): string =>
  Number.isInteger(value)
    ? value.toLocaleString("ru-RU")
    : value.toLocaleString("ru-RU", { maximumFractionDigits: 2 });

/** Метрики воркера компактно: числовые поля и ответ целиком по запросу. */
export const WorkerMetricsSummary: FC<WorkerMetricsSummaryProps> = ({
  metrics,
}) => {
  if (metrics === undefined) {
    return (
      <p className="text-xs text-muted-foreground">
        Метрик нет: воркер не отдаёт `GET /metrics` или не ответил.
      </p>
    );
  }

  const fields = numericFields(metrics).slice(0, MAX_FIELDS);

  return (
    <section className="flex flex-col gap-1.5">
      <h4 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        Метрики
      </h4>
      {fields.length > 0 && (
        <dl className="grid grid-cols-2 gap-x-4 gap-y-1 sm:grid-cols-3 xl:grid-cols-4">
          {fields.map(field => (
            <div
              key={field}
              className="flex min-w-0 justify-between gap-2 text-xs"
            >
              <dt className="truncate text-muted-foreground">{field}</dt>
              <dd className="tabular-nums">
                {formatNumber(readNumber(metrics, field) ?? 0)}
              </dd>
            </div>
          ))}
        </dl>
      )}
      <Collapse size="sm">
        <Collapse.Trigger>Ответ целиком</Collapse.Trigger>
        <Collapse.Content>
          <pre className="max-h-48 overflow-auto rounded bg-muted p-2 text-xs">
            {formatJson(metrics)}
          </pre>
        </Collapse.Content>
      </Collapse>
    </section>
  );
};
