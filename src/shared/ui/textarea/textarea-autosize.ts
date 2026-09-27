/** Высота строки, если `line-height` не задан числом (`normal`). */
const FALLBACK_LINE_HEIGHT = 20;

export interface AutosizeResult {
  /** Значение для `style.height`, px. */
  height: number;
  /** Содержимое выше `maxRows` — нужна прокрутка. */
  overflow: boolean;
}

const px = (value: string) => parseFloat(value) || 0;

/**
 * Высота textarea по содержимому в пределах `[minRows, maxRows]` строк.
 * `scrollHeight` включает отступы, но не рамку: при `border-box` рамку
 * добавляем, при `content-box` отступы вычитаем — иначе поле либо на пару
 * пикселей ниже содержимого (лишний скролл), либо выше на отступы.
 * Вызывать после `style.height = "auto"`.
 */
export const measureAutosize = (
  element: HTMLTextAreaElement,
  minRows: number,
  maxRows: number,
): AutosizeResult => {
  const style = window.getComputedStyle(element);
  const lineHeight = px(style.lineHeight) || FALLBACK_LINE_HEIGHT;
  const padding = px(style.paddingTop) + px(style.paddingBottom);
  const border = px(style.borderTopWidth) + px(style.borderBottomWidth);
  const frame = style.boxSizing === "border-box" ? padding + border : 0;

  const natural = element.scrollHeight - padding + frame;
  const min = lineHeight * minRows + frame;
  const max = lineHeight * Math.max(minRows, maxRows) + frame;

  return {
    height: Math.min(Math.max(natural, min), max),
    overflow: natural > max,
  };
};
