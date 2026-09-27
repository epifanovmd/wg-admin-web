import { cn } from "@shared/lib/utils";
import { X } from "lucide-react";
import type * as React from "react";

export interface SelectTagProps {
  label: React.ReactNode;
  /** Текст для `aria-label` кнопки удаления. */
  removeLabel?: string;
  onRemove?: () => void;
  disabled?: boolean;
  className?: string;
}

const stopPointerDown = (e: React.PointerEvent) => {
  e.preventDefault();
  e.stopPropagation();
};

export const SelectTag = ({
  label,
  removeLabel,
  onRemove,
  disabled,
  className,
}: SelectTagProps) => {
  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onRemove?.();
  };

  const ariaLabel =
    `Удалить ${removeLabel ?? (typeof label === "string" ? label : "")}`.trim();

  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 rounded-sm bg-accent text-accent-foreground",
        "px-1.5 py-0.5 text-xs font-medium max-w-36",
        disabled && "opacity-50",
        className,
      )}
    >
      <span className="truncate">{label}</span>
      {onRemove && !disabled && (
        <button
          type="button"
          tabIndex={-1}
          aria-label={ariaLabel}
          onPointerDown={stopPointerDown}
          onClick={handleRemove}
          className="shrink-0 opacity-60 hover:opacity-100 transition-opacity ml-0.5 cursor-pointer"
        >
          <X aria-hidden className="h-3 w-3" />
        </button>
      )}
    </span>
  );
};
