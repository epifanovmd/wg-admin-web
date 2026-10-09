import { ConfigStateBadge, formatAgo, formatMoment } from "@entities/agent";
import { Badge, Card, Tooltip } from "@shared/ui";
import { FC } from "react";

import type { IWorkerConfigGroup } from "../model/useWgNodeConfigsVM";
import { ConfigResult } from "./ConfigResult";

interface WorkerConfigsCardProps {
  group: IWorkerConfigGroup;
}

/** Ключи настроек воркера: описание, версии, статус и итог применения. */
export const WorkerConfigsCard: FC<WorkerConfigsCardProps> = ({ group }) => (
  <Card
    title={`Настройки воркера ${group.worker}`}
    description={
      group.noManifest
        ? "Манифеста нет — какие ключи у воркера, неизвестно"
        : "Пишет сервер из данных ноды; агент применяет и сообщает итог"
    }
  >
    {group.items.length === 0 ? (
      <p className="text-sm text-muted-foreground">
        {group.noManifest
          ? "Ключи появятся, когда воркер ответит на GET /manifest."
          : "Воркер не объявил ключей настроек."}
      </p>
    ) : (
      <ul className="flex flex-col divide-y divide-border">
        {group.items.map(item => {
          const status = item.entry?.status;
          const config = item.entry?.config;

          return (
            <li
              key={item.key}
              className="flex flex-col gap-1 py-2.5 first:pt-0 last:pb-0"
            >
              <p className="flex flex-wrap items-center gap-2 text-sm">
                <span className="font-mono font-medium">{item.key}</span>
                {!item.manifest && (
                  <Tooltip content="Ключа нет в манифесте воркера: агент его не применит">
                    <Badge variant="warning">не в манифесте</Badge>
                  </Tooltip>
                )}
                {status ? (
                  <>
                    <ConfigStateBadge state={status.state} />
                    <span className="text-xs text-muted-foreground">
                      {[
                        status.version !== null && `версия ${status.version}`,
                        status.applied !== undefined &&
                          status.applied !== status.version &&
                          `применена ${status.applied}`,
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    </span>
                  </>
                ) : (
                  <Badge variant="muted">не задан</Badge>
                )}
              </p>
              {item.manifest?.description && (
                <p className="text-xs text-muted-foreground">
                  {item.manifest.description}
                </p>
              )}
              {status?.error && (
                <p className="text-xs text-destructive">
                  {status.error.code}: {status.error.message}
                </p>
              )}
              {config && (
                <Tooltip content={formatMoment(config.updatedAt)}>
                  <p className="w-fit text-xs text-muted-foreground">
                    изменено {formatAgo(config.updatedAt)}
                  </p>
                </Tooltip>
              )}
              {status?.state === "applied" && (
                <ConfigResult result={status.result} />
              )}
            </li>
          );
        })}
      </ul>
    )}
  </Card>
);
