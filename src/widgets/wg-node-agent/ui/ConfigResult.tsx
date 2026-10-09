import { formatJson, formatMoment } from "@entities/agent";
import { WgInterfaceStatusBadge } from "@entities/wg";
import { Collapse } from "@shared/ui";
import { FC } from "react";

import { parseWgStateResult } from "../model/state-result";

interface ConfigResultProps {
  /** Подробный итог применения от воркера (`status.result`). */
  result: unknown;
}

/**
 * Итог применения ключа: у `wg/state` — интерфейсы на ноде с состоянием и
 * ошибки, у остальных — JSON по раскрытию.
 */
export const ConfigResult: FC<ConfigResultProps> = ({ result }) => {
  if (result === undefined || result === null) return null;

  const state = parseWgStateResult(result);

  if (!state) {
    return (
      <Collapse size="sm">
        <Collapse.Trigger>Итог применения</Collapse.Trigger>
        <Collapse.Content>
          <pre className="max-h-48 overflow-auto rounded bg-muted p-2 text-xs">
            {formatJson(result)}
          </pre>
        </Collapse.Content>
      </Collapse>
    );
  }

  return (
    <div className="flex flex-col gap-1.5 pt-1">
      <p className="text-xs text-muted-foreground">
        {[
          state.appliedAt && `применено ${formatMoment(state.appliedAt)}`,
          `интерфейсов: ${state.interfaces.length}`,
        ]
          .filter(Boolean)
          .join(" · ")}
      </p>
      {state.interfaces.length > 0 && (
        <ul className="flex flex-wrap gap-x-4 gap-y-1">
          {state.interfaces.map(iface => (
            <li key={iface.name} className="flex items-center gap-1.5 text-sm">
              <span className="font-mono">{iface.name}</span>
              <WgInterfaceStatusBadge
                status={iface.status}
                message={iface.message}
              />
            </li>
          ))}
        </ul>
      )}
      {state.errors.length > 0 && (
        <ul className="text-xs text-destructive">
          {state.errors.map(error => (
            <li key={error}>{error}</li>
          ))}
        </ul>
      )}
    </div>
  );
};
