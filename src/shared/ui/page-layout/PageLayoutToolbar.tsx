import { cn } from "@shared/lib/utils";
import * as React from "react";

export interface PageLayoutToolbarProps {
  /** Короткая подводка слева. */
  lead?: React.ReactNode;
  /** Действия страницы справа, в той же строке. */
  actions?: React.ReactNode;
  className?: string;
}

const ROOT_CLASS = "flex flex-wrap items-center justify-between gap-2";
const LEAD_CLASS = "min-w-0 text-sm text-muted-foreground";
const ACTIONS_CLASS = "flex flex-shrink-0 items-center gap-2";

/** Строка над содержимым страницы: подводка и действия. */
export const PageLayoutToolbar = ({
  lead,
  actions,
  className,
}: PageLayoutToolbarProps) => (
  <div className={cn(ROOT_CLASS, className)}>
    <div className={LEAD_CLASS}>{lead}</div>
    <div className={ACTIONS_CLASS}>{actions}</div>
  </div>
);
