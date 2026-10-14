import { useClipboard, useEvent } from "@shared/lib/hooks";
import { Check, Copy } from "lucide-react";
import * as React from "react";

import { Button, type ButtonProps } from "./Button";

export interface CopyButtonProps extends Omit<
  ButtonProps,
  "leftIcon" | "asChild" | "type"
> {
  /** Что положить в буфер. */
  text: string;
  /** Подпись сразу после копирования. */
  copiedLabel?: string;
  /** Сколько держать отметку «скопировано», мс. */
  feedbackDurationMs?: number;
  onCopied?: () => void;
}

/**
 * Кнопка копирования в буфер: обычная кнопка с иконкой — встаёт в ряд с другими
 * кнопками. В отличие от `CopyableText` сам текст не показывает (ни в кнопке, ни
 * в подсказке): для длинного или многострочного содержимого (`.env`, команды).
 */
const CopyButton = React.forwardRef<HTMLButtonElement, CopyButtonProps>(
  (
    {
      text,
      copiedLabel = "Скопировано",
      feedbackDurationMs = 2000,
      onCopied,
      onClick,
      children = "Скопировать",
      ...props
    },
    ref,
  ) => {
    const clipboard = useClipboard({ timeout: feedbackDurationMs });
    const handleCopied = useEvent(() => onCopied?.());

    React.useEffect(() => {
      if (clipboard.copied) handleCopied();
    }, [clipboard.copied, handleCopied]);

    return (
      <Button
        ref={ref}
        type="button"
        leftIcon={
          clipboard.copied ? (
            <Check size={15} className="text-success" />
          ) : (
            <Copy size={15} />
          )
        }
        onClick={event => {
          onClick?.(event);
          // Внутри модалки поле для копирования — рядом с кнопкой (ловушка фокуса).
          clipboard.copy(text, event.currentTarget.parentElement ?? undefined);
        }}
        {...props}
      >
        {clipboard.copied ? copiedLabel : children}
        {clipboard.error && (
          <span className="sr-only">Не удалось скопировать</span>
        )}
      </Button>
    );
  },
);

CopyButton.displayName = "CopyButton";

export { CopyButton };
