import { cn } from "@shared/lib/utils";
import type { Column } from "@tanstack/react-table";
import type { CSSProperties } from "react";

export interface PinningStyleResult {
  style?: CSSProperties;
  className?: string;
}

/**
 * Закреплённая ячейка непрозрачна (`bg-card`), иначе под неё просвечивает
 * контент при горизонтальном скролле. Подсветка строки (hover / selected /
 * striped) и тон шапки/подвала поэтому дублируются слоем `::before` с
 * `z-index: -1` — внутри stacking context sticky-ячейки он ложится поверх
 * её фона, но под содержимое.
 */
const PINNED_CELL_CLASS = cn(
  "bg-card",
  "before:pointer-events-none before:absolute before:inset-0 before:-z-10 before:content-['']",
  "group-hover/row:before:bg-muted/50",
  "group-data-[state=selected]/row:before:bg-primary/5",
  "[[data-variant=striped]_tbody_tr:nth-child(even)>&]:before:bg-muted/40",
  "[thead_&]:before:bg-muted/50 [tfoot_&]:before:bg-muted/50",
);

const LEFT_EDGE_SHADOW = "shadow-[2px_0_4px_-2px_rgba(0,0,0,0.15)]";
const RIGHT_EDGE_SHADOW = "shadow-[-2px_0_4px_-2px_rgba(0,0,0,0.15)]";

const EMPTY: PinningStyleResult = {};

export const getPinningStyle = <TData, TValue>(
  column: Column<TData, TValue>,
): PinningStyleResult => {
  const pinned = column.getIsPinned();

  if (!pinned) return EMPTY;

  const isLastLeft = pinned === "left" && column.getIsLastColumn("left");
  const isFirstRight = pinned === "right" && column.getIsFirstColumn("right");

  return {
    style: {
      position: "sticky",
      left: pinned === "left" ? column.getStart("left") : undefined,
      right: pinned === "right" ? column.getAfter("right") : undefined,
      zIndex: 1,
    },
    className: cn(
      PINNED_CELL_CLASS,
      isLastLeft && LEFT_EDGE_SHADOW,
      isFirstRight && RIGHT_EDGE_SHADOW,
    ),
  };
};
