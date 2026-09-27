import { cn } from "@shared/lib/utils";
import { Info } from "lucide-react";
import * as React from "react";

import { Tooltip } from "../../tooltip";
import { RequiredMark } from "./RequiredMark";

export interface FieldLabelProps {
  label: React.ReactNode;
  htmlFor?: string;
  labelId?: string;
  required?: boolean;
  hint?: React.ReactNode;
  /** Подпись живёт внутри контрола и анимируется по фокусу/значению. */
  floating?: boolean;
}

const LABEL_BASE_CLASS = "font-medium leading-none select-none";
const LABEL_OUTSIDE_CLASS = "text-sm text-foreground";
const LABEL_FLOATING_CLASS = cn(
  "cursor-text text-sm text-muted-foreground transition-all duration-200",
  "group-focus-within/floating:text-xs group-focus-within/floating:text-foreground",
  "group-has-[[data-has-value=true]]/floating:text-xs",
  "group-has-[[aria-invalid=true]]/floating:text-destructive",
);
const HINT_TRIGGER_CLASS =
  "inline-flex cursor-help items-center text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:text-foreground";
const HINT_CONTENT_PROPS = { className: "max-w-[260px] text-xs" };
const HINT_ICON_CLASS = "h-3.5 w-3.5";

/**
 * Подпись поля с отметкой обязательности и кнопкой подсказки. Тултип
 * использует глобальный TooltipProvider приложения.
 */
export const FieldLabel = ({
  label,
  htmlFor,
  labelId,
  required,
  hint,
  floating = false,
}: FieldLabelProps) => {
  const labelClass = cn(
    LABEL_BASE_CLASS,
    floating ? LABEL_FLOATING_CLASS : LABEL_OUTSIDE_CLASS,
    !htmlFor && "cursor-default",
  );

  return (
    <>
      <label
        id={labelId}
        htmlFor={htmlFor}
        data-slot="field-label"
        className={labelClass}
      >
        {label}
        {required && <RequiredMark />}
      </label>
      {hint !== undefined && (
        <Tooltip content={hint} contentProps={HINT_CONTENT_PROPS}>
          <button
            type="button"
            aria-label="Подсказка"
            className={HINT_TRIGGER_CLASS}
            data-slot="field-hint"
          >
            <Info aria-hidden className={HINT_ICON_CLASS} />
          </button>
        </Tooltip>
      )}
    </>
  );
};
