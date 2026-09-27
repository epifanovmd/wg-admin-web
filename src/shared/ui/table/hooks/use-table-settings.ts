import { useControllableState } from "@shared/lib/hooks";
import type {
  ColumnOrderState,
  ColumnPinningState,
  ColumnResizeMode,
  ColumnSizingState,
  VisibilityState,
} from "@tanstack/react-table";
import { useCallback, useMemo, useState } from "react";

import {
  useColumnOrderFeature,
  useColumnPinningFeature,
  useColumnSizingFeature,
  useColumnVisibilityFeature,
} from "./features";
import type { TableFeatureResult } from "./features/types";

/** Пользовательские настройки колонок — сериализуемый снимок для хранения. */
export interface TableSettings {
  columnVisibility?: VisibilityState;
  columnOrder?: ColumnOrderState;
  columnSizing?: ColumnSizingState;
  columnPinning?: ColumnPinningState;
}

export type TableSettingsPart = keyof TableSettings;

export type TableSettingsUpdater =
  TableSettings | ((prev: TableSettings) => TableSettings);

export interface UseTableSettingsOptions {
  /** Управляемые настройки; `undefined` — хук хранит их сам. */
  value?: TableSettings;
  /** Начальные настройки; функция вызывается один раз (чтение из хранилища). */
  defaultValue?: TableSettings | (() => TableSettings | undefined);
  /**
   * Любое изменение колонок — целым снимком. При ресайзе зовётся на каждый
   * шаг перетаскивания: для дорогого хранилища стоит отложить запись.
   */
  onChange?: (settings: TableSettings) => void;
  /** Какие настройки подключать; по умолчанию — все четыре. */
  parts?: readonly TableSettingsPart[];
  /** Во что превращает настройки `reset`; по умолчанию — пустой снимок (как в колонках). */
  resetValue?: TableSettings;
  columnResizeMode?: ColumnResizeMode;
}

export interface UseTableSettingsResult<TData> {
  settings: TableSettings;
  setSettings: (updater: TableSettingsUpdater) => void;
  /** Сбрасывает настройки к `resetValue`. */
  reset: () => void;
  /** Фичи для `features` таблицы; можно дополнять своими. */
  features: TableFeatureResult<TData>[];
}

const ALL_PARTS: readonly TableSettingsPart[] = [
  "columnVisibility",
  "columnOrder",
  "columnSizing",
  "columnPinning",
];

const EMPTY_SETTINGS: TableSettings = {};
const EMPTY_VISIBILITY: VisibilityState = {};
const EMPTY_ORDER: ColumnOrderState = [];
const EMPTY_SIZING: ColumnSizingState = {};
const EMPTY_PINNING: ColumnPinningState = { left: [], right: [] };

const resolveInitial = (
  defaultValue: UseTableSettingsOptions["defaultValue"],
): TableSettings =>
  (typeof defaultValue === "function" ? defaultValue() : defaultValue) ??
  EMPTY_SETTINGS;

/**
 * Видимость, порядок, ширины и закрепление колонок одним состоянием: хук
 * отдаёт готовые фичи, а где хранить снимок (localStorage, сервер, URL) —
 * решает потребитель через `defaultValue`/`onChange` или `value`.
 */
export const useTableSettings = <TData = unknown>(
  options: UseTableSettingsOptions = {},
): UseTableSettingsResult<TData> => {
  const {
    value,
    defaultValue,
    onChange,
    parts = ALL_PARTS,
    resetValue = EMPTY_SETTINGS,
    columnResizeMode,
  } = options;

  const [initial] = useState(() => resolveInitial(defaultValue));

  const [settings, setSettings] = useControllableState<TableSettings>({
    value,
    defaultValue: initial,
    onChange,
  });

  const setPart = useCallback(
    <K extends TableSettingsPart>(key: K, next: TableSettings[K]) =>
      setSettings(prev => ({ ...prev, [key]: next })),
    [setSettings],
  );

  const onVisibilityChange = useCallback(
    (next: VisibilityState) => setPart("columnVisibility", next),
    [setPart],
  );
  const onOrderChange = useCallback(
    (next: ColumnOrderState) => setPart("columnOrder", next),
    [setPart],
  );
  const onSizingChange = useCallback(
    (next: ColumnSizingState) => setPart("columnSizing", next),
    [setPart],
  );
  const onPinningChange = useCallback(
    (next: ColumnPinningState) => setPart("columnPinning", next),
    [setPart],
  );

  const visibility = useColumnVisibilityFeature<TData>({
    enabled: parts.includes("columnVisibility"),
    columnVisibilityState: settings.columnVisibility ?? EMPTY_VISIBILITY,
    onColumnVisibilityChange: onVisibilityChange,
  });
  const order = useColumnOrderFeature<TData>({
    enabled: parts.includes("columnOrder"),
    columnOrderState: settings.columnOrder ?? EMPTY_ORDER,
    onColumnOrderChange: onOrderChange,
  });
  const sizing = useColumnSizingFeature<TData>({
    enabled: parts.includes("columnSizing"),
    columnSizingState: settings.columnSizing ?? EMPTY_SIZING,
    onColumnSizingChange: onSizingChange,
    columnResizeMode,
  });
  const pinning = useColumnPinningFeature<TData>({
    enabled: parts.includes("columnPinning"),
    columnPinningState: settings.columnPinning ?? EMPTY_PINNING,
    onColumnPinningChange: onPinningChange,
  });

  const features = useMemo(
    () =>
      [visibility, order, sizing, pinning].filter(feature =>
        parts.includes(feature.kind as TableSettingsPart),
      ),
    [visibility, order, sizing, pinning, parts],
  );

  const reset = useCallback(
    () => setSettings(resetValue),
    [setSettings, resetValue],
  );

  return { settings, setSettings, reset, features };
};
