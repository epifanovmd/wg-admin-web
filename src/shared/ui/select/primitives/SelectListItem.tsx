import { cn } from "@shared/lib/utils";
import { Check } from "lucide-react";
import * as React from "react";

import {
  selectItemClasses,
  selectItemHighlightedClasses,
} from "../select-variants";

export interface SelectListItemProps {
  id?: string;
  index: number;
  selected?: boolean;
  focused?: boolean;
  disabled?: boolean;
  /** Стабильные колбэки с индексом — чтобы `memo` реально срабатывал. */
  onSelect?: (index: number) => void;
  onFocus?: (index: number) => void;
  /** Размер набора и позиция — для виртуального списка, где в DOM не все опции. */
  setSize?: number;
  posInSet?: number;
  children?: React.ReactNode;
}

const preventFocusSteal = (e: React.PointerEvent) => e.preventDefault();

const SelectListItemInner = ({
  id,
  index,
  selected,
  focused,
  disabled,
  onSelect,
  onFocus,
  setSize,
  posInSet,
  children,
}: SelectListItemProps) => {
  const handleClick = () => {
    if (!disabled) onSelect?.(index);
  };

  const handleMouseEnter = () => onFocus?.(index);

  return (
    <div
      id={id}
      role="option"
      aria-selected={selected}
      aria-disabled={disabled || undefined}
      aria-setsize={setSize}
      aria-posinset={posInSet}
      className={cn(
        selectItemClasses,
        "hover:bg-accent hover:text-accent-foreground",
        focused && selectItemHighlightedClasses,
        disabled && "pointer-events-none opacity-50",
      )}
      onMouseEnter={handleMouseEnter}
      onPointerDown={preventFocusSteal}
      onClick={handleClick}
    >
      <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
        {selected && <Check className="h-4 w-4" />}
      </span>
      {children}
    </div>
  );
};

/** Опций может быть много, а на hover меняется только одна — memo оправдан. */
export const SelectListItem = React.memo(SelectListItemInner);

SelectListItem.displayName = "SelectListItem";
