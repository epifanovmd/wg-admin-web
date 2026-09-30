import type { Uuid } from "./uuid.ts";

export type WgInterfaceOptionsParams = {
  nodeId?: Uuid;
  /**
   * Только свои интерфейсы (владелец или создатель) при любой области прав
   */
  mine?: boolean;
};
