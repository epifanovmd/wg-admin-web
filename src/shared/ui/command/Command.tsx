import { cn } from "@shared/lib/utils";
import { Command as CommandPrimitive } from "cmdk";
import * as React from "react";

export type CommandProps = React.ComponentPropsWithoutRef<
  typeof CommandPrimitive
>;

const ROOT_CLASS =
  "flex size-full flex-col overflow-hidden rounded-lg bg-popover text-sm text-popover-foreground";

/**
 * Корень командной панели (cmdk): фильтрует пункты по вводу и ведёт
 * выделение стрелками. `value`/`onValueChange` — выделенный пункт,
 * `shouldFilter={false}` — для собственной (например, серверной) фильтрации.
 */
const Command = React.forwardRef<
  React.ComponentRef<typeof CommandPrimitive>,
  CommandProps
>(({ className, ...props }, ref) => (
  <CommandPrimitive
    ref={ref}
    className={cn(ROOT_CLASS, className)}
    {...props}
  />
));

Command.displayName = "Command";

export { Command };
