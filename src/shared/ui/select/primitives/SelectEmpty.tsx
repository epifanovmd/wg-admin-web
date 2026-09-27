import { cn } from "@shared/lib/utils";
import type * as React from "react";

export interface SelectEmptyProps {
  className?: string;
  children?: React.ReactNode;
}

export const SelectEmpty = ({
  className,
  children = "Нет вариантов",
}: SelectEmptyProps) => (
  <div
    className={cn(
      "flex items-center justify-center px-2 py-6 text-sm text-muted-foreground",
      className,
    )}
  >
    {children}
  </div>
);
