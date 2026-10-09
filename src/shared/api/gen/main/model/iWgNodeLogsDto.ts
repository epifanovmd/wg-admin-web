import type { IWgNodeLogsDtoEntriesItem } from "./iWgNodeLogsDtoEntriesItem.ts";

/**
 * Журнал агента или воркера ноды.
 */
export interface IWgNodeLogsDto {
  /** Строки журнала текстом: `время уровень источник: сообщение`. */
  content: string;
  entries: IWgNodeLogsDtoEntriesItem[];
}
