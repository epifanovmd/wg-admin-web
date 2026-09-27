import { cn } from "@shared/lib/utils";
import { Command as CommandPrimitive } from "cmdk";
import * as React from "react";

export type CommandEmptyProps = React.ComponentPropsWithoutRef<
  typeof CommandPrimitive.Empty
>;

const EMPTY_CLASS = "py-6 text-center text-sm text-muted-foreground";

/** Показывается, когда фильтр не оставил ни одного пункта. */
const CommandEmpty = React.forwardRef<
  React.ComponentRef<typeof CommandPrimitive.Empty>,
  CommandEmptyProps
>(({ className, children = "Ничего не найдено", ...props }, ref) => (
  <CommandPrimitive.Empty
    ref={ref}
    className={cn(EMPTY_CLASS, className)}
    {...props}
  >
    {children}
  </CommandPrimitive.Empty>
));

CommandEmpty.displayName = "CommandEmpty";

export { CommandEmpty };
