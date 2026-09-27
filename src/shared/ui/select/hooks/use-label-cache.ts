import * as React from "react";

import type { LabeledValue, SelectOption, SelectValue } from "../types";
import { getOptionText } from "../utils/get-option-text";

export interface UseLabelCacheResult<V extends SelectValue> {
  /** Текст опции по значению; для незнакомого значения — `String(value)`. */
  getLabel: (value: V) => string;
  toLabeled: (value: V) => LabeledValue<V>;
}

/**
 * Кэш «значение → текст»: помнит подписи опций, которые уже исчезли из
 * списка (серверный поиск, пагинация), чтобы триггер и `LabeledValue`
 * не теряли текст выбранного.
 */
export const useLabelCache = <V extends SelectValue>(
  options: SelectOption<V>[],
  seed?: LabeledValue<V>[],
): UseLabelCacheResult<V> => {
  const [cache] = React.useState(() => new Map<V, string>());

  // Идемпотентная запись в стабильную Map: безопасно во время рендера.
  seed?.forEach(item => {
    if (item.label != null && !cache.has(item.value)) {
      cache.set(item.value, item.label);
    }
  });
  options.forEach(option => cache.set(option.value, getOptionText(option)));

  const getLabel = React.useCallback(
    (value: V): string => cache.get(value) ?? String(value),
    [cache],
  );

  const toLabeled = React.useCallback(
    (value: V): LabeledValue<V> => ({ value, label: getLabel(value) }),
    [getLabel],
  );

  return { getLabel, toLabeled };
};
