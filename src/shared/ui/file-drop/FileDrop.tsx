import { cn } from "@shared/lib/utils";
import { UploadCloud } from "lucide-react";
import * as React from "react";

import { type FileRejection, validateFiles } from "./validate-files";

type NativeInputProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "type" | "accept" | "multiple" | "disabled" | "onChange" | "className"
>;

export interface FileDropProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "onDrop" | "title"
> {
  onFiles: (files: File[]) => void;
  /**
   * Правила `accept` для input; файлы, не прошедшие проверку (и при
   * перетаскивании, и из диалога), отбрасываются и приходят в `onReject`.
   */
  accept?: string;
  /** Максимальный размер одного файла, байт. */
  maxSize?: number;
  /**
   * Сколько файлов принять за одну операцию; лишние отклоняются с причиной
   * `count`. При накоплении списка передавайте остаток (`useFileList().remaining`).
   */
  maxFiles?: number;
  /**
   * Отклонённые файлы; второй аргумент — причины (`type`/`size`/`count`)
   * в том же порядке.
   */
  onReject?: (files: File[], rejections: FileRejection[]) => void;
  multiple?: boolean;
  /**
   * Выбор папки целиком через диалог (Chromium/WebKit); пути файлов — в
   * `webkitRelativePath`. При перетаскивании папка приходит одним пустым
   * файлом: обход дерева (`DataTransferItem.webkitGetAsEntry`) не выполняется.
   */
  directory?: boolean;
  disabled?: boolean;
  title?: React.ReactNode;
  hint?: React.ReactNode;
  /** Дополнительные атрибуты скрытого `<input type="file">`. */
  inputProps?: NativeInputProps;
}

const collect = (list: FileList | null): File[] =>
  list ? Array.from(list) : [];

const ROOT_CLASS = cn(
  "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-muted/30 px-4 py-8 text-center transition-colors",
  "hover:border-brand/60 hover:bg-brand/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40",
);

const OVER_CLASS = "border-brand bg-brand/10";

const DISABLED_CLASS =
  "cursor-not-allowed opacity-60 hover:border-border hover:bg-muted/30";

/** Область для перетаскивания файлов; клик и Enter/Space открывают системный диалог. */
const FileDrop = React.forwardRef<HTMLDivElement, FileDropProps>(
  (
    {
      onFiles,
      onReject,
      accept,
      maxSize,
      maxFiles,
      multiple = true,
      directory,
      disabled,
      title = "Перетащите файлы сюда",
      hint = "или нажмите, чтобы выбрать",
      inputProps,
      className,
      onClick,
      onKeyDown,
      onDragEnter,
      onDragOver,
      onDragLeave,
      ...props
    },
    ref,
  ) => {
    const inputRef = React.useRef<HTMLInputElement>(null);
    const hintId = React.useId();
    const [isOver, setOver] = React.useState(false);

    /**
     * dragenter/dragleave стреляют на каждом дочернем элементе: подсветка
     * держится по глубине вложенности, а не по последнему событию.
     */
    const dragDepth = React.useRef(0);

    const resetDrag = () => {
      dragDepth.current = 0;
      setOver(false);
    };

    const openDialog = () => {
      if (!disabled) inputRef.current?.click();
    };

    const emitFiles = (files: File[]) => {
      const { accepted, rejections } = validateFiles(files, {
        accept,
        maxSize,
        maxFiles,
      });

      if (rejections.length) {
        onReject?.(
          rejections.map(rejection => rejection.file),
          rejections,
        );
      }
      if (accepted.length) onFiles(multiple ? accepted : accepted.slice(0, 1));
    };

    const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
      onClick?.(event);
      openDialog();
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
      onKeyDown?.(event);

      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openDialog();
      }
    };

    const handleDragEnter = (event: React.DragEvent<HTMLDivElement>) => {
      onDragEnter?.(event);
      event.preventDefault();
      dragDepth.current += 1;
      if (!disabled) setOver(true);
    };

    const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
      onDragOver?.(event);
      event.preventDefault();
    };

    const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
      onDragLeave?.(event);
      dragDepth.current = Math.max(0, dragDepth.current - 1);
      if (dragDepth.current === 0) setOver(false);
    };

    const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      resetDrag();

      if (disabled) return;

      emitFiles(collect(event.dataTransfer.files));
    };

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = collect(event.target.files);

      event.target.value = "";
      if (files.length) emitFiles(files);
    };

    /** Клик по input всплывает к области и открыл бы диалог второй раз. */
    const handleInputClick = (event: React.MouseEvent<HTMLInputElement>) => {
      event.stopPropagation();
    };

    // Нестандартный атрибут выбора папки: в типах React его нет.
    const directoryAttrs = directory ? { webkitdirectory: "" } : undefined;

    return (
      <div
        ref={ref}
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-disabled={disabled}
        aria-describedby={hint ? hintId : undefined}
        data-drag-over={isOver ? "" : undefined}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          ROOT_CLASS,
          isOver && OVER_CLASS,
          disabled && DISABLED_CLASS,
          className,
        )}
        {...props}
      >
        <UploadCloud aria-hidden className="text-muted-foreground" size={28} />
        <p className="text-sm font-medium text-foreground">{title}</p>
        {hint && (
          <p id={hintId} className="text-xs text-muted-foreground">
            {hint}
          </p>
        )}
        <input
          {...inputProps}
          ref={inputRef}
          type="file"
          className="sr-only"
          accept={accept}
          multiple={multiple}
          disabled={disabled}
          {...directoryAttrs}
          onClick={handleInputClick}
          onChange={handleInputChange}
        />
      </div>
    );
  },
);

FileDrop.displayName = "FileDrop";

export { FileDrop };
