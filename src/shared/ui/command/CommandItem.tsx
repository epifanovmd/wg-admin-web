import { cn } from "@shared/lib/utils";
import { Command as CommandPrimitive } from "cmdk";
import * as React from "react";

import { MENU_ITEM_ICON_CLASS } from "../foundation";
import { CommandShortcut } from "./CommandShortcut";

export interface CommandItemProps extends React.ComponentPropsWithoutRef<
  typeof CommandPrimitive.Item
> {
  /** Иконка слева от подписи. */
  icon?: React.ReactNode;
  /** Клавиатурное сочетание у правого края. */
  shortcut?: React.ReactNode;
}

const ITEM_CLASS = [
  "relative flex cursor-pointer select-none items-center gap-2 rounded-md px-2 py-1.5",
  "text-sm outline-none transition-colors",
  "data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground",
  "data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50",
  "[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
].join(" ");

/**
 * Пункт панели. Фильтруется по тексту или `value` (+ `keywords`),
 * `onSelect` срабатывает по клику и Enter.
 */
const CommandItem = React.forwardRef<
  React.ComponentRef<typeof CommandPrimitive.Item>,
  CommandItemProps
>(({ className, icon, shortcut, children, ...props }, ref) => (
  <CommandPrimitive.Item
    ref={ref}
    className={cn(ITEM_CLASS, className)}
    {...props}
  >
    {icon && (
      <span aria-hidden className={MENU_ITEM_ICON_CLASS}>
        {icon}
      </span>
    )}
    {children}
    {shortcut && <CommandShortcut>{shortcut}</CommandShortcut>}
  </CommandPrimitive.Item>
));

CommandItem.displayName = "CommandItem";

export { CommandItem };
