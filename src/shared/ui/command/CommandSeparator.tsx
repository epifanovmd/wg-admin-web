import { cn } from "@shared/lib/utils";
import { Command as CommandPrimitive } from "cmdk";
import * as React from "react";

import { MENU_SEPARATOR_CLASS } from "../foundation";

export type CommandSeparatorProps = React.ComponentPropsWithoutRef<
  typeof CommandPrimitive.Separator
>;

/** Разделитель групп; при поиске по умолчанию скрыт (`alwaysRender` — показать). */
const CommandSeparator = React.forwardRef<
  React.ComponentRef<typeof CommandPrimitive.Separator>,
  CommandSeparatorProps
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Separator
    ref={ref}
    className={cn(MENU_SEPARATOR_CLASS, "mx-0", className)}
    {...props}
  />
));

CommandSeparator.displayName = "CommandSeparator";

export { CommandSeparator };
