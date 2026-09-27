import type { ReactNode } from "react";

import { useKanbanLabels } from "../kanban-context";

export interface KanbanColumnEmptyProps {
  children?: ReactNode;
}

export const KanbanColumnEmpty = ({ children }: KanbanColumnEmptyProps) => {
  const labels = useKanbanLabels();

  return (
    <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed border-border/60 py-6 text-xs text-muted-foreground">
      {children ?? labels.emptyColumn}
    </div>
  );
};
