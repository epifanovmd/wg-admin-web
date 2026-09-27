import { cva } from "class-variance-authority";

export const drawerContentVariants = cva(
  "fixed z-50 flex flex-col border-border bg-background focus:outline-none",
  {
    variants: {
      direction: {
        bottom: "inset-x-0 bottom-0 mt-24 max-h-[90vh] rounded-t-xl border-t",
        top: "inset-x-0 top-0 mb-24 max-h-[90vh] rounded-b-xl border-b",
        left: "inset-y-0 left-0 h-full w-3/4 max-w-sm border-r",
        right: "inset-y-0 right-0 h-full w-3/4 max-w-sm border-l",
      },
    },
    defaultVariants: {
      direction: "bottom",
    },
  },
);

/** Ручка для свайпа есть только у вертикальных панелей. */
export const DRAWER_HANDLE_CLASS: Partial<Record<"top" | "bottom", string>> = {
  bottom: "mx-auto mt-4 h-2 w-24 shrink-0 rounded-full bg-muted",
  top: "order-last mx-auto mb-4 h-2 w-24 shrink-0 rounded-full bg-muted",
};
