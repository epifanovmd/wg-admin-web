import { SchemaHint } from "@entities/agent";
import type { AgentDto } from "@shared/api/gen/main/model";
import { Button, Card, Empty, Select, Skeleton } from "@shared/ui";
import { observer } from "mobx-react-lite";
import { FC } from "react";

import { useWgNodeEventsVM } from "../model/useWgNodeEventsVM";
import { AgentEventItem } from "./AgentEventItem";

interface WgNodeEventsTabProps {
  agent: AgentDto;
}

const ALL = "*";

/** События воркеров агента ноды с фильтром по воркеру и типу. */
export const WgNodeEventsTab: FC<WgNodeEventsTabProps> = observer(
  ({ agent }) => {
    const vm = useWgNodeEventsVM(agent);
    const { feed } = vm;

    return (
      <Card
        title="События"
        description="Что сообщают воркеры, новые сверху"
        extra={
          <div className="flex flex-wrap gap-2">
            <div className="w-44">
              <Select
                value={vm.worker ?? ALL}
                onChange={value =>
                  vm.setWorker(!value || value === ALL ? null : value)
                }
                options={[
                  { value: ALL, label: "Все воркеры" },
                  ...vm.workerOptions.map(name => ({
                    value: name,
                    label: name,
                  })),
                ]}
                aria-label="Воркер"
              />
            </div>
            <div className="w-52">
              <Select
                value={vm.type ?? ALL}
                onChange={value =>
                  vm.setType(!value || value === ALL ? null : value)
                }
                options={[
                  { value: ALL, label: "Все типы" },
                  ...vm.typeOptions.map(type => ({ value: type, label: type })),
                ]}
                aria-label="Тип события"
              />
            </div>
          </div>
        }
      >
        {vm.declaration && (
          <div className="mb-4 flex flex-col gap-2">
            {vm.declaration.description && (
              <p className="text-sm text-muted-foreground">
                {vm.declaration.description}
              </p>
            )}
            <SchemaHint
              schema={vm.declaration.schema}
              label="data события"
              emptyText="Схемы data воркер не объявил."
            />
          </div>
        )}
        {feed.isLoading && feed.items.length === 0 ? (
          <Skeleton className="h-24 w-full" />
        ) : feed.items.length === 0 ? (
          <Empty
            size="sm"
            title="Событий нет"
            description={
              feed.error?.message ??
              "Воркеры сообщают здесь об итогах применения и смене маршрутов"
            }
          />
        ) : (
          <div className="flex flex-col gap-3">
            <ul className="flex flex-col divide-y divide-border">
              {feed.items.map(event => (
                <AgentEventItem key={event.id} event={event} />
              ))}
            </ul>
            {feed.hasMore && (
              <Button
                variant="outline"
                className="self-center"
                loading={feed.isLoadingMore}
                onClick={() => void feed.loadMore()}
              >
                Показать ещё
              </Button>
            )}
          </div>
        )}
      </Card>
    );
  },
);
