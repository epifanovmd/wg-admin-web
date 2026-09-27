import { Alert, type AlertVariant } from "@shared/ui/alert";
import { Button, type ButtonProps } from "@shared/ui/button";
import { clsx } from "clsx";
import { Loader2 } from "lucide-react";
import * as React from "react";
import { toast } from "react-hot-toast";
import { twMerge } from "tailwind-merge";

export type ToastVariant = "success" | "error" | "warning" | "info" | "loading";

export interface ToastAction {
  label: string;
  onClick: () => void;
  variant?: ButtonProps["variant"];
  dismiss?: boolean;
}

export interface CustomToastProps {
  id: string;
  variant: ToastVariant;
  message: React.ReactNode;
  title?: React.ReactNode;
  action?: ToastAction | ToastAction[];
  visible: boolean;
  dismissible?: boolean;
}

const SPINNER = <Loader2 className="h-4 w-4 animate-spin" />;

const ALERT_VARIANT: Record<ToastVariant, AlertVariant> = {
  success: "success",
  error: "destructive",
  warning: "warning",
  info: "info",
  loading: "info",
};

export const NotificationToast: React.FC<CustomToastProps> = ({
  id,
  variant,
  message,
  title,
  action,
  visible,
  dismissible = true,
}) => {
  const isLoading = variant === "loading";
  const actions = action ? (Array.isArray(action) ? action : [action]) : [];

  return (
    <div
      className={twMerge(
        clsx(
          "min-w-[280px] max-w-[400px] rounded-lg bg-card shadow-lg",
          visible
            ? "animate-in slide-in-from-right-5 fade-in duration-300 ease-out"
            : "animate-out slide-out-to-right-5 fade-out duration-200 ease-in fill-mode-forwards",
        ),
      )}
    >
      <Alert
        variant={ALERT_VARIANT[variant]}
        title={title}
        icon={isLoading ? SPINNER : undefined}
        onClose={dismissible ? () => toast.dismiss(id) : undefined}
      >
        {message}
        {actions.length > 0 && (
          <div className="mt-2.5 flex flex-wrap gap-2">
            {actions.map(a => (
              <Button
                key={a.label}
                type="button"
                size="sm"
                variant={a.variant ?? "outline"}
                onClick={() => {
                  a.onClick();
                  if (a.dismiss !== false) toast.dismiss(id);
                }}
              >
                {a.label}
              </Button>
            ))}
          </div>
        )}
      </Alert>
    </div>
  );
};
