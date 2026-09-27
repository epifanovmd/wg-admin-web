import { cn } from "@shared/lib/utils";
import * as React from "react";

export type InputActionButtonProps =
  React.ButtonHTMLAttributes<HTMLButtonElement>;

const ACTION_BUTTON_CLASS =
  "inline-flex shrink-0 cursor-pointer items-center justify-center text-muted-foreground transition-colors hover:text-foreground";

/** Не даёт кнопке забрать фокус у поля при клике мышью. */
const preventFocusSteal = (event: React.PointerEvent<HTMLButtonElement>) => {
  event.preventDefault();
};

/** Кнопка действия внутри поля (очистка, показ пароля): не уводит фокус из input. */
const InputActionButton = React.forwardRef<
  HTMLButtonElement,
  InputActionButtonProps
>(({ className, ...props }, ref) => (
  <button
    ref={ref}
    type="button"
    onPointerDown={preventFocusSteal}
    className={cn(ACTION_BUTTON_CLASS, className)}
    {...props}
  />
));

InputActionButton.displayName = "InputActionButton";

export { InputActionButton };
