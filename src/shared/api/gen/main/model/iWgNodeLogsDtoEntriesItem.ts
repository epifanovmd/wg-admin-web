import type { RecordStringUnknown } from "./recordStringUnknown.ts";

export type IWgNodeLogsDtoEntriesItem = {
  attrs?: RecordStringUnknown;
  msg: string;
  source: string;
  level: string;
  at: number;
};
