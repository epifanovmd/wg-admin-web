import { useClipboard, useEvent } from "@shared/lib/hooks";
import { cn } from "@shared/lib/utils";
import { Check, Copy } from "lucide-react";
import * as React from "react";

import { Tooltip } from "../tooltip";

export interface CopyableTextProps extends Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  "children" | "type" | "onCopy"
> {
  text: string;
  displayText?: string;
  truncate?: boolean;
  /** Подпись тултипа сразу после копирования. */
  copiedLabel?: string;
  /** Сколько держать отметку «скопировано», мс. */
  feedbackDurationMs?: number;
  onCopied?: () => void;
}

const COPY_ERROR_LABEL = "Не удалось скопировать";

/**
 * Текст с кнопкой копирования в буфер. Клик не всплывает: компонент часто
 * живёт внутри кликабельных строк и карточек, и копирование не должно их
 * активировать.
 */
const CopyableText = React.forwardRef<HTMLButtonElement, CopyableTextProps>(
  (
    {
      text,
      displayText,
      truncate = true,
      className,
      copiedLabel = "Скопировано",
      feedbackDurationMs = 2000,
      onCopied,
      onClick,
      ...props
    },
    ref,
  ) => {
    const clipboard = useClipboard({ timeout: feedbackDurationMs });
    const [hovered, setHovered] = React.useState(false);
    const handleCopied = useEvent(() => onCopied?.());

    React.useEffect(() => {
      if (clipboard.copied) handleCopied();
    }, [clipboard.copied, handleCopied]);

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      event.stopPropagation();
      onClick?.(event);
      clipboard.copy(text, event.currentTarget.parentElement ?? undefined);
    };

    const errorLabel = clipboard.error ? COPY_ERROR_LABEL : null;
    const tooltipContent = clipboard.copied
      ? copiedLabel
      : (errorLabel ?? text);
    const iconNode = clipboard.copied ? (
      <Check aria-hidden size={12} className="text-success" />
    ) : (
      <Copy aria-hidden size={12} />
    );

    return (
      <Tooltip
        content={tooltipContent}
        open={clipboard.copied || hovered}
        onOpenChange={setHovered}
      >
        <button
          ref={ref}
          type="button"
          onClick={handleClick}
          aria-label={`Копировать: ${displayText ?? text}`}
          className={cn(
            "group inline-flex min-w-0 max-w-full cursor-pointer items-center gap-1.5 font-mono text-xs",
            className,
          )}
          {...props}
        >
          <span className={cn("min-w-0", truncate && "flex-1 truncate")}>
            {displayText ?? text}
          </span>
          <span className="flex-shrink-0 text-muted-foreground transition-colors group-hover:text-foreground">
            {iconNode}
          </span>
          <span className="sr-only" aria-live="polite">
            {clipboard.copied ? copiedLabel : ""}
          </span>
        </button>
      </Tooltip>
    );
  },
);

CopyableText.displayName = "CopyableText";

export { CopyableText };
