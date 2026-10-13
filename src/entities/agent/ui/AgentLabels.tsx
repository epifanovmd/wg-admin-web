import { cn } from "@shared/lib/utils/cn";
import { CodeChip } from "@shared/ui";
import { FC } from "react";

import { agentLabels } from "../lib/agent";

interface AgentLabelsProps {
  labels: Record<string, string>;
  /** Что показать без меток. */
  emptyText?: string;
  /** Каждая метка в одну строку с обрезкой, целиком — в подсказке (для таблиц). */
  compact?: boolean;
}

/** Метки агента «ключ=значение». */
export const AgentLabels: FC<AgentLabelsProps> = ({
  labels,
  emptyText,
  compact,
}) => {
  const items = agentLabels(labels);

  if (items.length === 0) {
    return emptyText ? (
      <span className="text-muted-foreground">{emptyText}</span>
    ) : null;
  }

  return (
    <span className={cn("flex flex-wrap gap-1", compact && "min-w-0")}>
      {items.map(label => (
        <CodeChip
          key={label}
          title={compact ? label : undefined}
          className={cn(compact && "block max-w-full truncate")}
        >
          {label}
        </CodeChip>
      ))}
    </span>
  );
};
