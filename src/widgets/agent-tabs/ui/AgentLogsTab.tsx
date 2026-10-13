import {
  AGENT_LOG_LEVEL_LABELS,
  AGENT_LOG_LEVELS,
  agentWorkers,
  ALL_LOG_SOURCES,
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

import { AGENT_LOG_SOURCE, useAgentLogsVM } from "../model/useAgentLogsVM";
import { AgentLiveLog } from "./AgentLiveLog";

interface AgentLogsTabProps {
  agent: AgentDto;
  /** Можно запросить записи журнала с узла. */
  canLogs: boolean;
}

const LEVEL_OPTIONS = AGENT_LOG_LEVELS.map(level => ({
  value: level,
  label: AGENT_LOG_LEVEL_LABELS[level],
}));

/**
 * Журнал агента на всю высоту вкладки: живые записи агента и воркеров и
 * последние записи журнала агента или воркера с узла.
 */
export const AgentLogsTab: FC<AgentLogsTabProps> = observer(
  ({ agent, canLogs }) => {
    const vm = useAgentLogsVM(agent.id);
    const { live } = vm;
    const online = agent.online && !agent.revoked;

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
                  label: source === "agent" ? "агент" : `воркер ${source}`,
                })),
              ]}
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
        {canLogs && (
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
                    ...agentWorkers(agent).map(worker => ({
                      value: worker.name,
                      label: `воркер ${worker.name}`,
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
            {vm.tailError && (
              <Alert variant="destructive">{vm.tailError}</Alert>
            )}
            {vm.tail !== null && (
              <pre className="max-h-96 min-h-40 overflow-auto rounded-lg bg-muted p-3 text-xs">
                {vm.tail}
              </pre>
            )}
          </div>
        )}
      </div>
    );
  },
);
