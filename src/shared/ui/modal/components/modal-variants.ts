import { cva } from "class-variance-authority";

/** Ниже `sm` — на весь экран с отступами под вырезы и системные панели. */
const FULL_SCREEN_MOBILE = [
  "max-sm:inset-0 max-sm:h-dvh max-sm:max-h-dvh max-sm:w-full max-sm:max-w-none",
  "max-sm:translate-x-0 max-sm:translate-y-0 max-sm:rounded-none max-sm:border-0",
  "max-sm:pt-[env(safe-area-inset-top)] max-sm:pb-[env(safe-area-inset-bottom)]",
  "max-sm:pl-[env(safe-area-inset-left)] max-sm:pr-[env(safe-area-inset-right)]",
].join(" ");

export const modalContentVariants = cva(
  "fixed z-50 flex max-h-[85vh] flex-col border bg-background shadow-lg duration-200 focus:outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 rounded-xl",
  {
    variants: {
      position: {
        center:
          "left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
        top: "left-1/2 top-[10%] -translate-x-1/2 data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top",
        bottom:
          "left-1/2 bottom-[10%] -translate-x-1/2 data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom",
      },
      size: {
        sm: "w-full max-w-sm",
        md: "w-full max-w-lg",
        lg: "w-full max-w-2xl",
        xl: "w-full max-w-4xl",
        full: "h-[calc(100dvh-2rem)] max-h-[calc(100dvh-2rem)] w-[calc(100vw-2rem)] max-w-none",
      },
      fullScreenOnMobile: {
        true: FULL_SCREEN_MOBILE,
        false: "",
      },
    },
    defaultVariants: {
      position: "center",
      size: "md",
      fullScreenOnMobile: false,
    },
  },
);

/** Крестик в полноэкранном режиме уходит ниже выреза экрана. */
export const MODAL_CLOSE_FULL_SCREEN_MOBILE_CLASS =
  "max-sm:top-[calc(env(safe-area-inset-top)+0.75rem)] max-sm:right-[calc(env(safe-area-inset-right)+0.75rem)]";
