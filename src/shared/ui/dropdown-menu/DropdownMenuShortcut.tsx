import { cn } from "@shared/lib/utils";
import * as React from "react";

import { MENU_SHORTCUT_CLASS } from "../foundation";

export type DropdownMenuShortcutProps = React.HTMLAttributes<HTMLSpanElement>;

/** Подпись клавиатурного сочетания у правого края пункта. */
const DropdownMenuShortcut = React.forwardRef<
  HTMLSpanElement,
  DropdownMenuShortcutProps
>(({ className, ...props }, ref) => (
  <span ref={ref} className={cn(MENU_SHORTCUT_CLASS, className)} {...props} />
));

DropdownMenuShortcut.displayName = "DropdownMenuShortcut";

export { DropdownMenuShortcut };
