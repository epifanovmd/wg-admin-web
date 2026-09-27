import { cn } from "@shared/lib/utils";
import * as React from "react";

import { MENU_SHORTCUT_CLASS } from "../foundation";

export type ContextMenuShortcutProps = React.HTMLAttributes<HTMLSpanElement>;

/** Подпись клавиатурного сочетания у правого края пункта. */
const ContextMenuShortcut = React.forwardRef<
  HTMLSpanElement,
  ContextMenuShortcutProps
>(({ className, ...props }, ref) => (
  <span ref={ref} className={cn(MENU_SHORTCUT_CLASS, className)} {...props} />
));

ContextMenuShortcut.displayName = "ContextMenuShortcut";

export { ContextMenuShortcut };
