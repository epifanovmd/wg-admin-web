/** Типы `<input>`, в которых нет ввода текста. */
const NON_TEXT_INPUT_TYPES = new Set([
  "button",
  "checkbox",
  "color",
  "file",
  "image",
  "radio",
  "range",
  "reset",
  "submit",
]);

const CONTENT_EDITABLE_SELECTOR =
  '[contenteditable=""], [contenteditable="true"], [contenteditable="plaintext-only"]';

/** Цель события — поле ввода текста или `contenteditable`. */
export const isEditableTarget = (target: EventTarget | null): boolean => {
  if (!(target instanceof HTMLElement)) return false;
  if (target.isContentEditable || target.closest(CONTENT_EDITABLE_SELECTOR)) {
    return true;
  }
  if (target instanceof HTMLInputElement) {
    return !NON_TEXT_INPUT_TYPES.has(target.type);
  }

  return (
    target instanceof HTMLTextAreaElement || target instanceof HTMLSelectElement
  );
};
