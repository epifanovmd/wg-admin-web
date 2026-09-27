import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Копирование в буфер. Clipboard API есть только в защищённом контексте
 * (https, localhost) — на странице по http копируем выделением скрытого поля.
 * `container` — где разместить поле: внутри модалки ловушка фокуса не даст
 * выделить поле, вставленное в `body`.
 */
export const copyToClipboard = async (
  text: string,
  container: HTMLElement = document.body,
): Promise<void> => {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);

    return;
  }

  const area = document.createElement("textarea");

  area.value = text;
  area.setAttribute("readonly", "");
  area.style.position = "fixed";
  area.style.opacity = "0";

  const previous =
    document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;

  container.appendChild(area);
  area.focus();
  area.select();

  try {
    if (!document.execCommand("copy")) {
      throw new Error("Копирование в буфер недоступно");
    }
  } finally {
    area.remove();
    previous?.focus();
  }
};

export interface UseClipboardOptions {
  /** Сколько держать `copied`, мс. */
  timeout?: number;
}

/** Копирование с отметкой «скопировано» и ошибкой. */
export const useClipboard = ({ timeout = 2000 }: UseClipboardOptions = {}) => {
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  const copy = useCallback(
    (text: string, container?: HTMLElement) => {
      copyToClipboard(text, container)
        .then(() => {
          setError(null);
          setCopied(true);
          clearTimeout(timer.current);
          timer.current = setTimeout(() => setCopied(false), timeout);
        })
        .catch((e: unknown) => {
          setCopied(false);
          setError(e instanceof Error ? e : new Error(String(e)));
        });
    },
    [timeout],
  );

  return { copy, copied, error };
};
