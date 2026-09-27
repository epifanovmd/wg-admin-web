import { cn } from "@shared/lib/utils";
import * as React from "react";

export type KbdProps = React.HTMLAttributes<HTMLElement>;

const KBD_CLASS =
  "rounded border border-border bg-muted px-1 font-mono text-[10px] text-muted-foreground";

/** Клавиша: горячая клавиша класса, подсказка в редакторе. */
const Kbd = React.forwardRef<HTMLElement, KbdProps>(
  ({ className, ...props }, ref) => (
    <kbd ref={ref} className={cn(KBD_CLASS, className)} {...props} />
  ),
);

Kbd.displayName = "Kbd";

export { Kbd };
