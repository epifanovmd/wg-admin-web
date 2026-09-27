import { cn } from "@shared/lib/utils";
import { MoreHorizontal } from "lucide-react";
import * as React from "react";

import { CONTROL_HEIGHT } from "../foundation/control-size";
import { type PaginationSize } from "./pagination.types";

export interface PaginationEllipsisProps {
  size: PaginationSize;
}

/** Декоративный разрыв между страницами: не кнопка и не читается скринридером. */
export const PaginationEllipsis = ({ size }: PaginationEllipsisProps) => (
  <span
    aria-hidden
    className={cn(
      "inline-flex min-w-10 items-center justify-center text-muted-foreground",
      CONTROL_HEIGHT[size],
    )}
  >
    <MoreHorizontal className="h-4 w-4" />
  </span>
);
