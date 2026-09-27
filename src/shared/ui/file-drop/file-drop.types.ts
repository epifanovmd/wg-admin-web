import type { ReactNode } from "react";

export interface FileDropListItemData {
  /** Стабильный ключ элемента (см. `useFileList`). */
  id: string;
  file: File;
  /** Прогресс загрузки от 0 до 1; `undefined` — полоса не показывается. */
  progress?: number;
  /** Текст ошибки: элемент подсвечивается, прогресс скрывается. */
  error?: ReactNode;
}
