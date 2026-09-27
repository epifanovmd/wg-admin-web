import { cn } from "@shared/lib/utils";
import { Command as CommandPrimitive } from "cmdk";
import * as React from "react";

export type CommandGroupProps = React.ComponentPropsWithoutRef<
  typeof CommandPrimitive.Group
>;

const GROUP_CLASS = [
  "overflow-hidden p-1 text-popover-foreground",
  "[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5",
  "[&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-semibold",
  "[&_[cmdk-group-heading]]:text-muted-foreground",
].join(" ");

/** Группа пунктов с заголовком `heading`; скрывается, если все пункты отфильтрованы. */
const CommandGroup = React.forwardRef<
  React.ComponentRef<typeof CommandPrimitive.Group>,
  CommandGroupProps
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Group
    ref={ref}
    className={cn(GROUP_CLASS, className)}
    {...props}
  />
));

CommandGroup.displayName = "CommandGroup";

export { CommandGroup };
