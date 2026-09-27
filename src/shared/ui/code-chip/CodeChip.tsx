import { cn } from "@shared/lib/utils";
import * as React from "react";

export interface CodeChipProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Приглушённый пунктир: элемент есть, но не задействован. */
  muted?: boolean;
}

const BASE_CLASS =
  "inline-flex items-center gap-1 rounded border px-1.5 font-mono text-[11px]";
const ACTIVE_CLASS = "border-border bg-muted/40 text-foreground";
const MUTED_CLASS =
  "border-dashed border-border text-muted-foreground line-through";

/** Короткое техническое имя моноширинным: класс модели, индекс датасета. */
const CodeChip = React.forwardRef<HTMLSpanElement, CodeChipProps>(
  ({ muted = false, className, ...props }, ref) => (
    <span
      ref={ref}
      className={cn(BASE_CLASS, muted ? MUTED_CLASS : ACTIVE_CLASS, className)}
      {...props}
    />
  ),
);

CodeChip.displayName = "CodeChip";

export { CodeChip };
