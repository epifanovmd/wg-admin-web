import { cn } from "@shared/lib/utils";
import { Plus } from "lucide-react";
import type * as React from "react";

import {
  selectItemClasses,
  selectItemHighlightedClasses,
} from "../select-variants";

export interface SelectCreateItemProps {
  id?: string;
  focused?: boolean;
  onSelect?: () => void;
  onFocus?: () => void;
  className?: string;
  children?: React.ReactNode;
}

const ICON_SLOT_CLASS =
  "absolute left-2 flex h-3.5 w-3.5 items-center justify-center";

const preventFocusSteal = (e: React.PointerEvent) => e.preventDefault();

/** Пункт «Создать «запрос»» в списке creatable-селекта. */
export const SelectCreateItem = ({
  id,
  focused,
  onSelect,
  onFocus,
  className,
  children,
}: SelectCreateItemProps) => (
  <div
    id={id}
    role="option"
    aria-selected={false}
    data-create-option=""
    className={cn(
      selectItemClasses,
      "hover:bg-accent hover:text-accent-foreground",
      focused && selectItemHighlightedClasses,
      className,
    )}
    onMouseEnter={onFocus}
    onPointerDown={preventFocusSteal}
    onClick={onSelect}
  >
    <span className={ICON_SLOT_CLASS}>
      <Plus aria-hidden className="h-4 w-4" />
    </span>
    {children}
  </div>
);
