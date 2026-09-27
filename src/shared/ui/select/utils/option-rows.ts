import type { SelectOption, SelectOptionGroup, SelectValue } from "../types";

/** Строка плоского (виртуального) списка. `index` — индекс опции в `options`. */
export type OptionRow<V extends SelectValue> =
  | { kind: "create"; key: string }
  | { kind: "group"; key: string; label: string }
  | { kind: "option"; key: string; option: SelectOption<V>; index: number };

/** Группы, оставшиеся после фильтрации `options`, без пустых. */
export const getVisibleGroups = <V extends SelectValue>(
  groups: SelectOptionGroup<V>[],
  indexByValue: Map<V, number>,
): SelectOptionGroup<V>[] =>
  groups
    .map(group => ({
      ...group,
      options: group.options.filter(option => indexByValue.has(option.value)),
    }))
    .filter(group => group.options.length > 0);

const toOptionRow = <V extends SelectValue>(
  option: SelectOption<V>,
  index: number,
): OptionRow<V> => ({
  kind: "option",
  key: `option:${String(option.value)}`,
  option,
  index,
});

/**
 * Плоские строки для виртуального списка: пункт «Создать», затем опции;
 * при группах — заголовок группы отдельной строкой перед её опциями.
 */
export const buildOptionRows = <V extends SelectValue>(
  options: SelectOption<V>[],
  indexByValue: Map<V, number>,
  groups: SelectOptionGroup<V>[] | undefined,
  withCreate: boolean,
): OptionRow<V>[] => {
  const rows: OptionRow<V>[] = withCreate
    ? [{ kind: "create", key: "create" }]
    : [];

  if (!groups) {
    options.forEach((option, index) => rows.push(toOptionRow(option, index)));

    return rows;
  }

  getVisibleGroups(groups, indexByValue).forEach(group => {
    rows.push({
      kind: "group",
      key: `group:${group.group}`,
      label: group.group,
    });
    group.options.forEach(option =>
      rows.push(toOptionRow(option, indexByValue.get(option.value) ?? -1)),
    );
  });

  return rows;
};

/** Навигационный индекс → индекс строки (для прокрутки виртуализатора). */
export const mapNavIndexToRow = <V extends SelectValue>(
  rows: OptionRow<V>[],
  optionOffset: number,
): Map<number, number> => {
  const map = new Map<number, number>();

  rows.forEach((row, rowIndex) => {
    if (row.kind === "create") map.set(0, rowIndex);
    if (row.kind === "option") map.set(row.index + optionOffset, rowIndex);
  });

  return map;
};
