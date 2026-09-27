import { cn } from "@shared/lib/utils";
import type { VariantProps } from "class-variance-authority";
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Info,
  X,
} from "lucide-react";
import * as React from "react";

import {
  ALERT_ICON_COLORS,
  type AlertVariant,
  alertVariants,
} from "./alert-variants";

const DEFAULT_ICONS: Record<AlertVariant, React.ReactNode> = {
  default: <Info aria-hidden className="h-4 w-4" />,
  info: <Info aria-hidden className="h-4 w-4" />,
  success: <CheckCircle2 aria-hidden className="h-4 w-4" />,
  warning: <AlertTriangle aria-hidden className="h-4 w-4" />,
  destructive: <AlertCircle aria-hidden className="h-4 w-4" />,
};

/** Срочные варианты объявляются немедленно, остальные — вежливо. */
const ASSERTIVE_VARIANTS: ReadonlySet<AlertVariant> = new Set([
  "destructive",
  "warning",
]);

const CLOSE_BUTTON_CLASS =
  "-mr-1 shrink-0 cursor-pointer self-center rounded-md p-1 text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

export interface AlertProps
  extends
    Omit<React.HTMLAttributes<HTMLDivElement>, "title">,
    VariantProps<typeof alertVariants> {
  title?: React.ReactNode;
  /** `false` — без иконки; по умолчанию иконка подбирается по варианту. */
  icon?: React.ReactNode | false;
  onClose?: () => void;
  /** Доступное имя кнопки закрытия. */
  closeLabel?: string;
}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  (
    {
      className,
      variant,
      title,
      icon,
      onClose,
      closeLabel = "Закрыть",
      children,
      ...props
    },
    ref,
  ) => {
    const resolvedVariant: AlertVariant = variant ?? "default";
    const iconNode = icon === undefined ? DEFAULT_ICONS[resolvedVariant] : icon;
    const role = ASSERTIVE_VARIANTS.has(resolvedVariant) ? "alert" : "status";

    return (
      <div
        ref={ref}
        role={role}
        className={cn(alertVariants({ variant }), className)}
        {...props}
      >
        {icon !== false && (
          <span
            className={cn(
              "mt-0.5 shrink-0",
              ALERT_ICON_COLORS[resolvedVariant],
            )}
          >
            {iconNode}
          </span>
        )}
        <div className="min-w-0 flex-1">
          {title && (
            <p className="font-medium text-foreground leading-snug">{title}</p>
          )}
          {children && (
            <div className={cn("text-muted-foreground", title && "mt-1")}>
              {children}
            </div>
          )}
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label={closeLabel}
            className={CLOSE_BUTTON_CLASS}
          >
            <X aria-hidden className="h-4 w-4" />
          </button>
        )}
      </div>
    );
  },
);

Alert.displayName = "Alert";

export { Alert };
