import { cva, type VariantProps } from "class-variance-authority";

/**
 * Общие классы частей меню (DropdownMenu, ContextMenu): одна панель, один
 * пункт, одинаковые подписи, разделители и шорткаты. Высоту и точку
 * трансформации каждое меню добавляет со своими CSS-переменными Radix.
 */
export const MENU_CONTENT_CLASS = [
  "z-50 min-w-[8rem] overflow-x-hidden overflow-y-auto rounded-lg border border-border",
  "bg-popover p-1 text-sm text-popover-foreground shadow-md outline-none",
  "data-[state=open]:animate-in data-[state=closed]:animate-out",
  "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
  "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
  "data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2",
  "data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
].join(" ");

const MENU_ITEM_BASE = [
  "relative flex w-full cursor-pointer select-none items-center gap-2 rounded-md",
  "px-2 py-1.5 text-left text-sm outline-none transition-colors",
  "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
  "[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
].join(" ");

/** Пункт меню: вариант и отступ под колонку индикаторов (`inset`). */
export const menuItemVariants = cva(MENU_ITEM_BASE, {
  variants: {
    variant: {
      default:
        "text-popover-foreground data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground",
      destructive:
        "text-destructive data-[highlighted]:bg-destructive/10 data-[highlighted]:text-destructive",
    },
    inset: {
      true: "pl-8",
      false: "",
    },
  },
  defaultVariants: {
    variant: "default",
    inset: false,
  },
});

export type MenuItemVariantProps = VariantProps<typeof menuItemVariants>;

/** Пункт с индикатором (чекбокс, радио): слева всегда колонка под галочку. */
export const MENU_CHECKABLE_ITEM_CLASS = `${MENU_ITEM_BASE} pl-8 text-popover-foreground data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground`;

export const MENU_ITEM_INDICATOR_CLASS =
  "absolute left-2 flex size-4 items-center justify-center";

export const MENU_ITEM_ICON_CLASS =
  "inline-flex shrink-0 items-center text-muted-foreground";

export const MENU_SUB_TRIGGER_OPEN_CLASS =
  "data-[state=open]:bg-accent data-[state=open]:text-accent-foreground";

export const MENU_SUB_TRIGGER_CHEVRON_CLASS = "ml-auto text-muted-foreground";

export const MENU_LABEL_CLASS =
  "px-2 py-1.5 text-xs font-semibold text-muted-foreground";

export const MENU_LABEL_INSET_CLASS = "pl-8";

export const MENU_SEPARATOR_CLASS = "-mx-1 my-1 h-px bg-border";

export const MENU_SHORTCUT_CLASS =
  "ml-auto pl-4 text-xs tracking-widest text-muted-foreground";
