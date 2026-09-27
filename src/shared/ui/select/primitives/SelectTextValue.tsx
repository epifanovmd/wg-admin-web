import { cn } from "@shared/lib/utils";
import type * as React from "react";

export interface SelectTextValueProps {
  /** Нет значения — показывается placeholder приглушённым цветом. */
  muted?: boolean;
  children?: React.ReactNode;
}

/** Текстовое значение триггера (single и comma-режим multi). */
export const SelectTextValue = ({ muted, children }: SelectTextValueProps) => (
  <span className={cn("flex-1 truncate", muted && "text-muted-foreground")}>
    {children}
  </span>
);
