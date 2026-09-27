const REQUIRED_MARK_CLASS = "ml-0.5 text-destructive";

/** Визуальная отметка обязательного поля; для скринридеров есть `aria-required`. */
export const RequiredMark = () => (
  <span className={REQUIRED_MARK_CLASS} aria-hidden>
    *
  </span>
);
