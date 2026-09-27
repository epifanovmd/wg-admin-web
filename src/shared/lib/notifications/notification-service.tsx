/* eslint-disable check-file/filename-naming-convention -- класс-сервис, не компонент */
import { injectable } from "inversify";
import React from "react";
import { toast } from "react-hot-toast";

import {
  INotificationService,
  NotificationOptions,
  PromiseMessages,
} from "./notification.types";
import { NotificationToast, ToastVariant } from "./NotificationToast";

const DEFAULT_DURATION: Record<ToastVariant, number> = {
  success: 4000,
  error: 5000,
  warning: 4000,
  info: 4000,
  loading: Infinity,
};

@injectable()
export class NotificationService implements INotificationService {
  success(message: React.ReactNode, options?: NotificationOptions): string {
    return this._show("success", message, options);
  }

  error(message: React.ReactNode, options?: NotificationOptions): string {
    return this._show("error", message, options);
  }

  warning(message: React.ReactNode, options?: NotificationOptions): string {
    return this._show("warning", message, options);
  }

  info(message: React.ReactNode, options?: NotificationOptions): string {
    return this._show("info", message, options);
  }

  loading(message: React.ReactNode, options?: NotificationOptions): string {
    return this._show("loading", message, options);
  }

  promise<T>(
    promise: Promise<T>,
    messages: PromiseMessages<T>,
    options?: NotificationOptions,
  ): Promise<T> {
    const id = this.loading(messages.loading, options);

    promise.then(
      value => {
        const text =
          typeof messages.success === "function"
            ? messages.success(value)
            : messages.success;

        this.success(text, { ...options, id });
      },
      (error: unknown) => {
        const text =
          typeof messages.error === "function"
            ? messages.error(error)
            : messages.error;

        this.error(text, { ...options, id });
      },
    );

    return promise;
  }

  dismiss(id?: string): void {
    toast.dismiss(id);
  }

  private _show(
    variant: ToastVariant,
    message: React.ReactNode,
    { id, title, duration, action }: NotificationOptions = {},
  ): string {
    return toast.custom(
      t => (
        <NotificationToast
          id={t.id}
          variant={variant}
          message={message}
          title={title}
          action={action}
          visible={t.visible}
          dismissible={variant !== "loading"}
        />
      ),
      {
        id,
        duration: duration ?? DEFAULT_DURATION[variant],
        ariaProps: {
          role: "status",
          "aria-live": variant === "error" ? "assertive" : "polite",
        },
      },
    );
  }
}
