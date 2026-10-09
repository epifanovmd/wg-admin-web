import {
  AGENT_LOG_LEVEL_LABELS,
  AGENT_LOG_LEVELS,
  ALL_LOG_SOURCES,
  configuredWorkers,
  isAgentLive,
} from "@entities/agent";
import type { AgentDto } from "@shared/api/gen/main/model";
import {
  Alert,
  Button,
  NumberInput,
  PLAIN_NUMBER_FORMAT,
  Segmented,
  Select,
} from "@shared/ui";
import { Download, Eraser } from "lucide-react";
import { observer } from "mobx-react-lite";
import { FC } from "react";

import { AGENT_LOG_SOURCE, useWgNodeLogsVM } from "../model/useWgNodeLogsVM";
import { AgentLiveLog } from "./AgentLiveLog";

interface WgNodeLogsTabProps {
  nodeId: string;
  agent: AgentDto;
}

const LEVEL_OPTIONS = AGENT_LOG_LEVELS.map(level => ({
  value: level,
  label: AGENT_LOG_LEVEL_LABELS[level],
}));

const sourceLabel = (source: string): string =>
  source === AGENT_LOG_SOURCE ? "агент" : `воркер ${source}`;

/**
 * Журнал агента ноды на всю высоту вкладки: живые записи агента и воркеров и
 * последние записи журнала агента или воркера с узла.
 */
export const WgNodeLogsTab: FC<WgNodeLogsTabProps> = observer(
  ({ nodeId, agent }) => {
    const vm = useWgNodeLogsVM(nodeId, agent.id);
    const { live } = vm;
    const online = isAgentLive(agent);

    return (
      <div className="flex min-h-0 flex-1 flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Segmented
            value={live.level}
            onValueChange={live.setLevel}
            options={LEVEL_OPTIONS}
          />
          <div className="w-full sm:w-56">
            <Select
              value={live.source}
              onChange={value => live.setSource(value ?? ALL_LOG_SOURCES)}
              options={[
                { value: ALL_LOG_SOURCES, label: "Все источники" },
                ...live.sources.map(source => ({
                  value: source,
                  label: sourceLabel(source),
                })),
              ]}
              aria-label="Источник живого журнала"
            />
          </div>
          <Button
            variant="outline"
            leftIcon={<Eraser size={15} />}
            onClick={live.clear}
          >
            Очистить
          </Button>
        </div>
        <AgentLiveLog
          entries={live.entries}
          emptyText={
            online
              ? "Записей пока нет — новые появятся здесь"
              : "Агент без связи: живого журнала нет"
          }
        />
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-muted-foreground">
              Журнал с узла:
            </span>
            <div className="w-full sm:w-48">
              <Select
                value={vm.source}
                onChange={value => vm.setSource(value ?? AGENT_LOG_SOURCE)}
                options={[
                  { value: AGENT_LOG_SOURCE, label: "агент" },
                  ...configuredWorkers(agent).map(worker => ({
                    value: worker.name,
                    label: sourceLabel(worker.name),
                  })),
                ]}
                aria-label="Чей журнал"
              />
            </div>
            <NumberInput
              value={vm.lines}
              onValueChange={vm.setLines}
              min={1}
              max={5000}
              formatOptions={PLAIN_NUMBER_FORMAT}
              className="w-28"
              aria-label="Сколько записей"
            />
            <Button
              variant="outline"
              leftIcon={<Download size={15} />}
              loading={vm.isTailLoading}
              disabled={!online}
              onClick={vm.loadTail}
            >
              Загрузить
            </Button>
          </div>
          {vm.tailError && <Alert variant="destructive">{vm.tailError}</Alert>}
          {vm.tail !== null && (
            <pre className="max-h-96 min-h-40 overflow-auto rounded-lg bg-muted p-3 text-xs">
              {vm.tail}
            </pre>
          )}
        </div>
      </div>
    );
  },
);
