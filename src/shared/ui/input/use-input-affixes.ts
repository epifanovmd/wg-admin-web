import * as React from "react";

/** Отступ левого кластера от края поля: `left-3` без иконки, `left-10` после неё. */
const PREFIX_OFFSET_PX = 12;
const PREFIX_AFTER_ICON_OFFSET_PX = 40;
/** Отступ правого кластера (`right-3`). */
const ACTIONS_OFFSET_PX = 12;
/** Зазор между аффиксом и текстом поля. */
const AFFIX_GAP_PX = 6;

interface UseInputAffixesOptions {
  hasPrefix: boolean;
  hasSuffix: boolean;
  hasLeftContent: boolean;
  style: React.CSSProperties | undefined;
}

interface UseInputAffixesResult {
  prefixRef: React.RefObject<HTMLSpanElement | null>;
  actionsRef: React.RefObject<HTMLDivElement | null>;
  /** Итоговый style поля: рассчитанные отступы под пользовательским style. */
  inputStyle: React.CSSProperties | undefined;
}

/** Ширина элемента с пересчётом при ресайзе; 0, пока измерение выключено. */
const useElementWidth = (
  ref: React.RefObject<HTMLElement | null>,
  enabled: boolean,
): number => {
  const [width, setWidth] = React.useState(0);

  React.useLayoutEffect(() => {
    const element = ref.current;

    if (!enabled || !element) {
      setWidth(0);

      return;
    }

    const measure = () => setWidth(element.offsetWidth);

    measure();

    if (typeof ResizeObserver === "undefined") return;

    const observer = new ResizeObserver(measure);

    observer.observe(element);

    return () => observer.disconnect();
  }, [enabled, ref]);

  return width;
};

/**
 * Отступы поля под текстовые аффиксы: ширина префикса и правого кластера
 * (суффикс + действия) измеряется, чтобы текст не заходил под них при любой
 * длине аффикса.
 */
export const useInputAffixes = ({
  hasPrefix,
  hasSuffix,
  hasLeftContent,
  style,
}: UseInputAffixesOptions): UseInputAffixesResult => {
  const prefixRef = React.useRef<HTMLSpanElement>(null);
  const actionsRef = React.useRef<HTMLDivElement>(null);
  const prefixWidth = useElementWidth(prefixRef, hasPrefix);
  const actionsWidth = useElementWidth(actionsRef, hasSuffix);

  const inputStyle = React.useMemo(() => {
    if (!hasPrefix && !hasSuffix) return style;

    const prefixOffset = hasLeftContent
      ? PREFIX_AFTER_ICON_OFFSET_PX
      : PREFIX_OFFSET_PX;

    return {
      ...(hasPrefix && {
        paddingLeft: `${prefixOffset + prefixWidth + AFFIX_GAP_PX}px`,
      }),
      ...(hasSuffix && {
        paddingRight: `${ACTIONS_OFFSET_PX + actionsWidth + AFFIX_GAP_PX}px`,
      }),
      ...style,
    };
  }, [actionsWidth, hasLeftContent, hasPrefix, hasSuffix, prefixWidth, style]);

  return { prefixRef, actionsRef, inputStyle };
};
