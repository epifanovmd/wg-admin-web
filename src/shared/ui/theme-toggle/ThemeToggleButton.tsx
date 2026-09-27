import { cn } from "@shared/lib/utils";
import { Moon, Sun } from "lucide-react";
import * as React from "react";

import { Button, type ButtonProps } from "../button";

export interface ThemeToggleButtonProps extends Omit<ButtonProps, "onClick"> {
  isDark: boolean;
  onToggle: () => void;
}

/** Презентационная кнопка смены темы; состояние и стор — у потребителя. */
const ThemeToggleButton = React.forwardRef<
  HTMLButtonElement,
  ThemeToggleButtonProps
>(({ isDark, onToggle, className, ...props }, ref) => {
  const label = isDark ? "Включить светлую тему" : "Включить тёмную тему";

  return (
    <Button
      ref={ref}
      type="button"
      variant="outline"
      size="sm"
      onClick={onToggle}
      aria-label={label}
      aria-pressed={isDark}
      className={cn("relative", className)}
      {...props}
    >
      <Sun
        aria-hidden
        className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0"
      />
      <Moon
        aria-hidden
        className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100"
      />
    </Button>
  );
});

ThemeToggleButton.displayName = "ThemeToggleButton";

export { ThemeToggleButton };
