import { FC } from "react";

import type { IWorkerRow } from "../model/useAgentWorkersVM";
import { WorkerManifestSection } from "./WorkerManifestSection";
import { WorkerMetricsSummary } from "./WorkerMetricsSummary";

interface WorkerDetailsProps {
  row: IWorkerRow;
}

/**
 * Раскрытая строка воркера: каталог возможностей из манифеста (команды со
 * схемами аргументов и итога, события со схемой, запросы к серверу, ключи
 * настроек), сообщение пульса и метрики.
 */
export const WorkerDetails: FC<WorkerDetailsProps> = ({ row }) => {
  const { worker, metrics } = row;
  const manifest = worker.manifest;
  const message = worker.health?.message || worker.message;

  return (
    <div className="flex flex-col gap-4 px-4 py-3 text-sm">
      {message && <p className="text-muted-foreground">{message}</p>}
      {!manifest ? (
        <p className="text-muted-foreground">
          Манифеста нет: воркер ещё не зарегистрировался у агента.
        </p>
      ) : (
        <>
          {manifest.description && <p>{manifest.description}</p>}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
            <WorkerManifestSection
              title="Команды"
              items={(manifest.commands ?? []).map(command => ({
                key: command.type,
                name: command.type,
                description: command.description,
                schemas: [
                  { label: "аргументы", schema: command.schema },
                  { label: "итог", schema: command.result },
                ],
              }))}
            />
            <WorkerManifestSection
              title="События"
              items={(manifest.events ?? []).map(event => ({
                key: event.type,
                name: event.type,
                description: event.description,
                schemas: [{ label: "data", schema: event.schema }],
              }))}
            />
            <WorkerManifestSection
              title="Запросы к серверу"
              items={(manifest.requests ?? []).map(request => ({
                key: request.type,
                name: request.type,
                description: request.description,
                schemas: [
                  { label: "данные", schema: request.schema },
                  { label: "ответ сервера", schema: request.response },
                ],
              }))}
            />
            <WorkerManifestSection
              title="Ключи настроек"
              items={(manifest.configs ?? []).map(config => ({
                key: config.key,
                name: config.key,
                description: config.description,
                schemas: [{ label: "значение", schema: config.schema }],
              }))}
            />
          </div>
        </>
      )}
      <WorkerMetricsSummary metrics={metrics} />
    </div>
  );
};
