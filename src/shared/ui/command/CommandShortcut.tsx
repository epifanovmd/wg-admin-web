import { cn } from "@shared/lib/utils";
import * as React from "react";

import { MENU_SHORTCUT_CLASS } from "../foundation";

export type CommandShortcutProps = React.HTMLAttributes<HTMLSpanElement>;

/** Подпись клавиатурного сочетания у правого края пункта. */
const CommandShortcut = React.forwardRef<HTMLSpanElement, CommandShortcutProps>(
  ({ className, ...props }, ref) => (
    <span ref={ref} className={cn(MENU_SHORTCUT_CLASS, className)} {...props} />
  ),
);

CommandShortcut.displayName = "CommandShortcut";

export { CommandShortcut };
