import { cn } from "@shared/lib/utils";
import { Command as CommandPrimitive } from "cmdk";
import * as React from "react";

export type CommandListProps = React.ComponentPropsWithoutRef<
  typeof CommandPrimitive.List
>;

const LIST_CLASS = "max-h-80 scroll-py-1 overflow-x-hidden overflow-y-auto";

/** Прокручиваемый список групп и пунктов; высоту меняют через `className`. */
const CommandList = React.forwardRef<
  React.ComponentRef<typeof CommandPrimitive.List>,
  CommandListProps
>(({ className, ...props }, ref) => (
  <CommandPrimitive.List
    ref={ref}
    className={cn(LIST_CLASS, className)}
    {...props}
  />
));

CommandList.displayName = "CommandList";

export { CommandList };
