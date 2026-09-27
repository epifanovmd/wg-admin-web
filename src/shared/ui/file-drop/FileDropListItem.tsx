import { cn } from "@shared/lib/utils";
import { X } from "lucide-react";
import * as React from "react";

import { IconButton } from "../icon-button";
import { Progress } from "../progress";
import type { FileDropListItemData } from "./file-drop.types";
import { getFileTypeIcon, isImageFile } from "./file-type-icon";
import { formatFileSize } from "./format-file-size";
import { useObjectUrl } from "./use-object-url";

export interface FileDropListItemProps extends Omit<
  React.LiHTMLAttributes<HTMLLIElement>,
  "children"
> {
  item: FileDropListItemData;
  /** Без обработчика кнопка удаления не показывается. */
  onRemove?: (item: FileDropListItemData) => void;
  /** Превью для изображений; по умолчанию включено. */
  preview?: boolean;
  /** Подпись кнопки удаления. */
  removeLabel?: (fileName: string) => string;
}

const ROOT_CLASS =
  "flex items-center gap-3 rounded-lg border border-border bg-card px-3 py-2";

const ERROR_CLASS = "border-destructive/50 bg-destructive/5";

const THUMB_CLASS =
  "flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-md bg-muted text-muted-foreground";

const defaultRemoveLabel = (fileName: string) => `Удалить файл ${fileName}`;

/** Строка выбранного файла: превью или иконка, имя, размер, прогресс, ошибка. */
const FileDropListItem = React.forwardRef<HTMLLIElement, FileDropListItemProps>(
  (
    {
      item,
      onRemove,
      preview = true,
      removeLabel = defaultRemoveLabel,
      className,
      ...props
    },
    ref,
  ) => {
    const { file, progress, error } = item;
    const previewUrl = useObjectUrl(preview && isImageFile(file) ? file : null);
    const Icon = getFileTypeIcon(file);
    const hasError = error !== undefined && error !== null && error !== false;
    const showProgress = !hasError && progress !== undefined;
    const errorId = React.useId();

    const handleRemove = () => onRemove?.(item);

    return (
      <li
        ref={ref}
        aria-describedby={hasError ? errorId : undefined}
        className={cn(ROOT_CLASS, hasError && ERROR_CLASS, className)}
        {...props}
      >
        <div className={THUMB_CLASS}>
          {previewUrl ? (
            <img src={previewUrl} alt="" className="size-full object-cover" />
          ) : (
            <Icon size={20} aria-hidden />
          )}
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <div className="flex items-baseline justify-between gap-3">
            <span className="truncate text-sm font-medium text-foreground">
              {file.name}
            </span>
            <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
              {formatFileSize(file.size)}
            </span>
          </div>

          {showProgress && (
            <Progress
              size="sm"
              value={progress}
              aria-label={file.name}
              variant={progress >= 1 ? "success" : "primary"}
            />
          )}

          {hasError && (
            <p id={errorId} className="text-xs text-destructive">
              {error}
            </p>
          )}
        </div>

        {onRemove && (
          <IconButton
            type="button"
            size="xs"
            aria-label={removeLabel(file.name)}
            onClick={handleRemove}
          >
            <X size={14} aria-hidden />
          </IconButton>
        )}
      </li>
    );
  },
);

FileDropListItem.displayName = "FileDropListItem";

export { FileDropListItem };
