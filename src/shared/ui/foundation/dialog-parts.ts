/**
 * Общие классы частей диалоговых окон (Modal, Drawer): один оверлей, одна
 * типографика заголовка и описания, одинаковые отступы шапки, тела и подвала.
 */
export const DIALOG_OVERLAY_CLASS = "fixed inset-0 z-50 bg-overlay";

export const DIALOG_TITLE_CLASS =
  "text-lg font-semibold leading-none tracking-tight";

export const DIALOG_DESCRIPTION_CLASS = "text-sm text-muted-foreground";

export const DIALOG_HEADER_CLASS =
  "flex flex-col gap-1.5 p-6 pb-4 text-center sm:text-left";

export const DIALOG_BODY_CLASS = "flex-1 overflow-y-auto px-6 pb-6";

export const DIALOG_FOOTER_CLASS =
  "flex flex-col-reverse gap-2 border-t border-border px-6 py-4 sm:flex-row sm:justify-end";
