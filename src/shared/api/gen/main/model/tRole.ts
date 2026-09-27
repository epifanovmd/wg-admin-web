import type { KnownRole } from "./knownRole.ts";

/**
 * Роль — произвольная строка; предопределённые значения дают автодополнение.
 */
export type TRole = KnownRole | string;
