import type { IWgMeshCell } from "@shared/api/gen/main/model";
import { pluralize } from "@shared/lib/utils";

/**
 * Через сколько без новых проб ячейка считается устаревшей, мс.
 *
 * Агент пробует раз в минуту: два с половиной интервала — пропущены минимум
 * две пробы подряд.
 */
export const MESH_STALE_MS = 150_000;

/** Ячейка устарела: новых проб нет дольше {@link MESH_STALE_MS}. */
export const isMeshCellStale = (ts: string, now: number) =>
  now - Date.parse(ts) > MESH_STALE_MS;

const pluralizeSamples = (count: number) =>
  pluralize(count, { one: "проба", few: "пробы", many: "проб" }, true);

/**
 * Подсказка ячейки: потери — среднее сервера за окно проб, сколько проб в
 * него легло; последняя проба без ответа и устаревание — отдельной пометкой.
 */
export const describeMeshCell = (cell: IWgMeshCell, now: number) => {
  const parts = [
    ...(isMeshCellStale(cell.ts, now) ? ["нет свежих данных"] : []),
    ...(cell.rttMs === null ? ["не отвечает (или ICMP закрыт)"] : []),
    `потери ${cell.lossPercent}%`,
    pluralizeSamples(cell.samples),
  ];
  const text = parts.join(" · ");

  return text.charAt(0).toUpperCase() + text.slice(1);
};
