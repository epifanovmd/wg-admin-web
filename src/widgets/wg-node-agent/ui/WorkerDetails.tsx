import { formatJson } from "@entities/agent";
import type { IAgentWorkerDto } from "@shared/api/gen/main/model";
import { Badge, Collapse } from "@shared/ui";
import { FC } from "react";

import { WorkerManifestSection } from "./WorkerManifestSection";

interface WorkerDetailsProps {
  worker: IAgentWorkerDto;
}

const reportBadge = (report: { version: number; ok?: boolean }) => (
  <Badge
    variant={
      report.ok === undefined ? "info" : report.ok ? "success" : "destructive"
    }
  >
    v{report.version}
    {report.ok === undefined ? " · применяется" : report.ok ? "" : " · ошибка"}
  </Badge>
);

/**
 * Раскрытая строка воркера: каталог возможностей из манифеста (маршруты,
 * события, задачи, запросы к серверу, ключи настроек с итогом применения) и
 * сведения из `/health`.
 */
export const WorkerDetails: FC<WorkerDetailsProps> = ({ worker }) => {
  const manifest = worker.manifest;
  const info = worker.health?.info;

  return (
    <div className="flex flex-col gap-4 px-4 py-3 text-sm">
      {worker.builtin ? (
        <p className="text-muted-foreground">
          Встроенный воркер собирает метрики узла — они на вкладке «Обзор».
        </p>
      ) : !manifest ? (
        <p className="text-muted-foreground">
          Манифеста нет: воркер ещё не проверен или ответил на GET /manifest не
          так, как нужно.
        </p>
      ) : (
        <>
          {manifest.description && <p>{manifest.description}</p>}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
            <WorkerManifestSection
              title="Ключи настроек"
              items={manifest.configs.map(config => {
                const report = worker.configs?.[config.key];

                return {
                  key: config.key,
                  name: config.key,
                  description: config.description,
                  extra: report && reportBadge(report),
                  footer: report?.error && (
                    <span className="text-xs text-destructive">
                      {report.error.message}
                    </span>
                  ),
                  schemas: [{ label: "значение", schema: config.schema }],
                };
              })}
            />
            <WorkerManifestSection
              title="Маршруты"
              items={manifest.routes.map(route => ({
                key: `${route.method} ${route.path}`,
                name: `${route.method.toUpperCase()} ${route.path}`,
                description: route.description,
                schemas: [
                  { label: "тело запроса", schema: route.request },
                  { label: "ответ", schema: route.response },
                ],
              }))}
            />
            <WorkerManifestSection
              title="События"
              items={manifest.events.map(event => ({
                key: event.type,
                name: event.type,
                description: event.description,
                schemas: [{ label: "data", schema: event.schema }],
              }))}
            />
            <WorkerManifestSection
              title="Задачи"
              items={manifest.jobs.map(job => ({
                key: job.type,
                name: job.type,
                description: job.description,
                schemas: [{ label: "данные", schema: job.schema }],
              }))}
            />
            <WorkerManifestSection
              title="Запросы к серверу"
              items={manifest.requests.map(request => ({
                key: request.type,
                name: request.type,
                description: request.description,
                schemas: [
                  { label: "данные", schema: request.schema },
                  { label: "ответ сервера", schema: request.response },
                ],
              }))}
            />
          </div>
        </>
      )}
      {info && Object.keys(info).length > 0 && (
        <Collapse size="sm">
          <Collapse.Trigger>Сведения воркера (health.info)</Collapse.Trigger>
          <Collapse.Content>
            <pre className="max-h-48 overflow-auto rounded bg-muted p-2 text-xs">
              {formatJson(info)}
            </pre>
          </Collapse.Content>
        </Collapse>
      )}
    </div>
  );
};
