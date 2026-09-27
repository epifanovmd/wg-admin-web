import { cn } from "@shared/lib/utils";
import * as React from "react";

import type { FileDropListItemData } from "./file-drop.types";
import { FileDropListItem } from "./FileDropListItem";

export interface FileDropListProps extends Omit<
  React.HTMLAttributes<HTMLUListElement>,
  "children"
> {
  items: FileDropListItemData[];
  /** Без обработчика кнопки удаления не показываются. */
  onRemove?: (item: FileDropListItemData) => void;
  /** Превью изображений через object URL; по умолчанию включено. */
  preview?: boolean;
  /** Подпись кнопки удаления; по умолчанию «Удалить файл NAME». */
  removeLabel?: (fileName: string) => string;
}

/** Список выбранных файлов; пустой список не рендерится. */
const FileDropList = React.forwardRef<HTMLUListElement, FileDropListProps>(
  ({ items, onRemove, preview, removeLabel, className, ...props }, ref) => {
    if (items.length === 0) return null;

    return (
      <ul ref={ref} className={cn("flex flex-col gap-2", className)} {...props}>
        {items.map(item => (
          <FileDropListItem
            key={item.id}
            item={item}
            onRemove={onRemove}
            preview={preview}
            removeLabel={removeLabel}
          />
        ))}
      </ul>
    );
  },
);

FileDropList.displayName = "FileDropList";

export { FileDropList };
