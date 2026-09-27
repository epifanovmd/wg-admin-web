import { cn } from "@shared/lib/utils";
import * as React from "react";

export interface InfoFieldProps extends React.HTMLAttributes<HTMLDivElement> {
  label: React.ReactNode;
  value?: React.ReactNode;
  /** Что показать вместо пустого значения. */
  emptyText?: React.ReactNode;
  /** Действие справа от значения (кнопка, иконка и т.п.). */
  action?: React.ReactNode;
  truncate?: boolean;
}

/** Пусто — ничего или то, что React не отрисует; `0` — значение. */
const isEmptyValue = (value: React.ReactNode): boolean =>
  value === undefined || value === null || value === "" || value === false;

/**
 * Презентационное поле «лейбл / значение» с опциональным действием.
 * Доменно-нейтральный примитив для detail/settings-экранов.
 */
const InfoField = React.forwardRef<HTMLDivElement, InfoFieldProps>(
  (
    {
      label,
      value,
      emptyText = "—",
      action,
      truncate = true,
      className,
      ...props
    },
    ref,
  ) => {
    const shownValue = isEmptyValue(value) ? emptyText : value;

    return (
      <div
        ref={ref}
        className={cn("flex items-start justify-between gap-3 p-4", className)}
        {...props}
      >
        <div className="flex min-w-0 flex-col gap-0.5">
          <span className="text-xs uppercase tracking-wide text-muted-foreground">
            {label}
          </span>
          <span
            className={cn(
              "text-sm font-medium text-foreground",
              truncate && "truncate",
            )}
          >
            {shownValue}
          </span>
        </div>
        {action}
      </div>
    );
  },
);

InfoField.displayName = "InfoField";

export { InfoField };
