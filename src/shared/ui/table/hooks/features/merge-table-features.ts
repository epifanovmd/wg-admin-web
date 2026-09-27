import type { TableState } from "@tanstack/react-table";

import type {
  TableFeatureKind,
  TableFeatureOf,
  TableFeatureOptions,
  TableFeatureResult,
} from "./types";

export type TableFeaturesByKind<TData> = {
  [K in TableFeatureKind]?: TableFeatureOf<TData, K>;
};

export interface MergedTableFeatures<TData> {
  state: Partial<TableState>;
  options: TableFeatureOptions<TData>;
  byKind: TableFeaturesByKind<TData>;
}

/** Копирует только заданные значения: фича с `manualFiltering: undefined` не должна затирать соседнюю. */
const assignDefined = <T extends object>(target: T, source: Partial<T>) => {
  for (const key of Object.keys(source) as (keyof T)[]) {
    const value = source[key];

    if (value !== undefined) target[key] = value as T[keyof T];
  }
};

export const mergeTableFeatures = <TData>(
  features: TableFeatureResult<TData>[],
): MergedTableFeatures<TData> => {
  const state: Partial<TableState> = {};
  const options: TableFeatureOptions<TData> = {};
  const byKind: TableFeaturesByKind<TData> = {};

  for (const feature of features) {
    assignDefined(state, feature.state);
    assignDefined(options, feature.options);
    // TS не сужает объединение по `kind` при индексной записи — связь kind↔тип гарантирует TableFeatureResult.
    (byKind as Record<TableFeatureKind, TableFeatureResult<TData>>)[
      feature.kind
    ] = feature;
  }

  return { state, options, byKind };
};
