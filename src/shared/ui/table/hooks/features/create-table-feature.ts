import { useControllableState } from "@shared/lib/hooks";
import type { TableState } from "@tanstack/react-table";
import { useMemo } from "react";

import type {
  TableFeatureBase,
  TableFeatureKind,
  TableFeatureOptions,
} from "./types";

export interface TableFeatureStateOptions<TState> {
  enabled?: boolean;
  value?: TState;
  defaultValue?: TState;
  onChange?: (state: TState) => void;
}

/** Описание тривиальной фичи: один ключ состояния + `onXChange` в опциях таблицы. */
export interface TableFeatureSpec<
  K extends TableFeatureKind,
  S extends keyof TableState,
> {
  kind: K;
  stateKey: S;
  fallback: TableState[S];
  changeOption: `on${Capitalize<S>}Change`;
}

/**
 * Общий каркас для фич, состоящих из controllable-состояния и его сеттера.
 * `extraOptions` — дополнительные tanstack-опции, мемоизированные вызывающей стороной.
 */
export const useTableFeatureState = <
  TData,
  K extends TableFeatureKind,
  S extends keyof TableState,
>(
  spec: TableFeatureSpec<K, S>,
  {
    enabled = true,
    value,
    defaultValue,
    onChange,
  }: TableFeatureStateOptions<TableState[S]>,
  extraOptions?: TableFeatureOptions<TData>,
): TableFeatureBase<TData, K> => {
  const [state, setState] = useControllableState<TableState[S]>({
    value,
    defaultValue: defaultValue ?? spec.fallback,
    onChange,
  });

  return useMemo(
    () => ({
      kind: spec.kind,
      state: { [spec.stateKey]: state },
      options: {
        [spec.changeOption]: enabled ? setState : undefined,
        ...extraOptions,
      },
    }),
    [spec, state, setState, enabled, extraOptions],
  );
};
