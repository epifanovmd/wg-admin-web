import { cn } from "@shared/lib/utils";
import * as React from "react";

export interface LabeledFieldProps extends React.HTMLAttributes<HTMLDivElement> {
  label: React.ReactNode;
  /** Короткое пояснение справа от подписи: единицы, особые значения */
  hint?: React.ReactNode;
  /**
   * `id` контрола: подпись становится настоящим `<label for>`. Без него
   * обёртка получает `role="group"` и связывается с подписью через
   * `aria-labelledby` — подходит для составных контролов.
   */
  htmlFor?: string;
  children: React.ReactNode;
}

/**
 * Подпись над контролом вне формы. Подпись держится в одну строку (длинная —
 * обрезается): иначе поле с двухстрочной подписью съезжает вниз и строка
 * сетки разъезжается.
 */
/** Кегль задан явно: глобальный стиль `label` иначе делает подпись крупнее. */
const LABEL_CLASS = "truncate text-sm font-normal";

const LabeledField = React.forwardRef<HTMLDivElement, LabeledFieldProps>(
  ({ label, hint, htmlFor, className, children, ...props }, ref) => {
    const labelId = React.useId();

    const labelNode = htmlFor ? (
      <label htmlFor={htmlFor} id={labelId} className={LABEL_CLASS}>
        {label}
      </label>
    ) : (
      <span id={labelId} className={LABEL_CLASS}>
        {label}
      </span>
    );

    return (
      <div
        ref={ref}
        role={htmlFor ? undefined : "group"}
        aria-labelledby={htmlFor ? undefined : labelId}
        className={cn("flex min-w-0 flex-col gap-1", className)}
        {...props}
      >
        <span className="flex items-baseline justify-between gap-1 text-sm text-foreground">
          {labelNode}
          {hint && (
            <span className="shrink-0 text-xs text-muted-foreground">
              {hint}
            </span>
          )}
        </span>
        {children}
      </div>
    );
  },
);

LabeledField.displayName = "LabeledField";

export { LabeledField };
