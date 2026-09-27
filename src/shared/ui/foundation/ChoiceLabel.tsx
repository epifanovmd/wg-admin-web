import { cn } from "@shared/lib/utils";
import * as React from "react";

export interface ChoiceLabelProps {
  /** id контрола, к которому привязана подпись. */
  htmlFor: string;
  label?: React.ReactNode;
  description?: React.ReactNode;
  /** id описания — тот же, что передан контролу в `aria-describedby`. */
  descriptionId?: string;
  disabled?: boolean;
  className?: string;
  /** Сам контрол: чекбокс, радио или переключатель. */
  children: React.ReactNode;
}

const ROOT_CLASS = "flex gap-2.5";
/** С описанием контрол выравнивается по первой строке, без него — по центру. */
const ALIGN_WITH_DESCRIPTION = "items-start";
const ALIGN_SINGLE_LINE = "items-center";
const CONTROL_CLASS = "inline-flex shrink-0";
const CONTROL_WITH_DESCRIPTION_CLASS = "mt-0.5";
const LABEL_CLASS =
  "text-sm font-medium leading-snug text-foreground select-none";
const DESCRIPTION_CLASS = "mt-0.5 text-xs text-muted-foreground";

/**
 * Общая подпись для Checkbox / Radio / Switch. Подпись — `<label for>`, чтобы
 * клик по тексту переключал контрол, а описание лежит отдельно и не попадает
 * в accessible name: контрол ссылается на него через `aria-describedby`.
 * Контрол гасит себя сам, здесь гасится только текст.
 */
export const ChoiceLabel = ({
  htmlFor,
  label,
  description,
  descriptionId,
  disabled,
  className,
  children,
}: ChoiceLabelProps) => {
  const hasText = label !== undefined || description !== undefined;
  const hasDescription = description !== undefined;

  return (
    <div
      className={cn(
        ROOT_CLASS,
        hasDescription ? ALIGN_WITH_DESCRIPTION : ALIGN_SINGLE_LINE,
        className,
      )}
    >
      <span
        className={cn(
          CONTROL_CLASS,
          hasDescription && CONTROL_WITH_DESCRIPTION_CLASS,
        )}
      >
        {children}
      </span>
      {hasText && (
        <span className={cn("flex flex-col", disabled && "opacity-60")}>
          {label !== undefined && (
            <label
              htmlFor={htmlFor}
              className={cn(
                LABEL_CLASS,
                disabled ? "cursor-not-allowed" : "cursor-pointer",
              )}
            >
              {label}
            </label>
          )}
          {hasDescription && (
            <span id={descriptionId} className={DESCRIPTION_CLASS}>
              {description}
            </span>
          )}
        </span>
      )}
    </div>
  );
};
