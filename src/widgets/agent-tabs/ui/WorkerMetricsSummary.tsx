import {
  formatJson,
  metricFields,
  readMetric,
  type TMetricValue,
} from "@entities/agent";
import { cn } from "@shared/lib/utils";
import { Collapse } from "@shared/ui";
import { FC } from "react";

interface WorkerMetricsSummaryProps {
  /** Ответ `GET /metrics` воркера из последней точки. */
  metrics: unknown;
}

/** Показателей в сетке — не больше. */
const MAX_FIELDS = 16;

const formatMetric = (value: TMetricValue): string => {
  if (typeof value === "boolean") return value ? "да" : "нет";
  if (typeof value === "string") return value;

  return Number.isInteger(value)
    ? value.toLocaleString("ru-RU")
    : value.toLocaleString("ru-RU", { maximumFractionDigits: 2 });
};

/** Метрики воркера компактно: показатели (числа, строки, да/нет) и ответ целиком по запросу. */
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

  const fields = metricFields(metrics).slice(0, MAX_FIELDS);

  return (
    <section className="flex flex-col gap-1.5">
      <h4 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        Метрики
      </h4>
      {fields.length > 0 && (
        <dl className="grid grid-cols-2 gap-x-4 gap-y-1 sm:grid-cols-3 xl:grid-cols-4">
          {fields.map(field => {
            const value = readMetric(metrics, field) ?? 0;
            const text = formatMetric(value);

            return (
              <div
                key={field}
                className="flex min-w-0 justify-between gap-2 text-xs"
              >
                <dt className="shrink-0 text-muted-foreground">{field}</dt>
                <dd
                  title={text}
                  className={cn(
                    "min-w-0 truncate text-right",
                    typeof value === "number" && "tabular-nums",
                    value === false && "text-destructive",
                  )}
                >
                  {text}
                </dd>
              </div>
            );
          })}
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
