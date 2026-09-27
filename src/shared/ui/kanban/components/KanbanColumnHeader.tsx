import type { ReactNode } from "react";

import { Badge } from "../../badge";
import { useKanbanLabels } from "../kanban-context";

export interface KanbanColumnHeaderProps {
  title: ReactNode;
  count: number;
  limit?: number;
  /** id заголовка — на него ссылается `aria-labelledby` колонки. */
  id?: string;
}

export const KanbanColumnHeader = ({
  title,
  count,
  limit,
  id,
}: KanbanColumnHeaderProps) => {
  const labels = useKanbanLabels();
  const overLimit = limit != null && count > limit;

  return (
    <div className="flex items-center justify-between gap-2 px-3.5 py-3">
      <span id={id} className="truncate text-sm font-medium text-foreground">
        {title}
      </span>
      <Badge variant={overLimit ? "destructive" : "muted"}>
        {labels.count(count, limit)}
      </Badge>
    </div>
  );
};
