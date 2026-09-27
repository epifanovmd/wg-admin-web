import type { KnownPermission } from "./knownPermission.ts";

/**
 * Permission — произвольная строка; предопределённые значения дают автодополнение.
 */
export type TPermission = KnownPermission | string;
