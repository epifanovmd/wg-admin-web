import type { ComponentType } from "react";

import type { DateFilterConfig } from "./controls/DateFilterControl";
import { DateFilterControl } from "./controls/DateFilterControl";
import type { DateRangeFilterConfig } from "./controls/DateRangeFilterControl";
import { DateRangeFilterControl } from "./controls/DateRangeFilterControl";
import type { FacetedFilterConfig } from "./controls/FacetedFilterControl";
import { FacetedFilterControl } from "./controls/FacetedFilterControl";
import type {
  BaseFilterConfig,
  ColumnFilterOption,
} from "./controls/filter-config";
import type {
  FilterColumn,
  FilterControlProps,
} from "./controls/filter-control-props";
import type { MultiSelectFilterConfig } from "./controls/MultiSelectFilterControl";
import { MultiSelectFilterControl } from "./controls/MultiSelectFilterControl";
import type { SelectFilterConfig } from "./controls/SelectFilterControl";
import { SelectFilterControl } from "./controls/SelectFilterControl";
import type { TextFilterConfig } from "./controls/TextFilterControl";
import { TextFilterControl } from "./controls/TextFilterControl";

export type { BaseFilterConfig, ColumnFilterOption, FilterColumn };

export type ColumnFilterConfig<T = string> =
  | TextFilterConfig
  | FacetedFilterConfig
  | SelectFilterConfig<T>
  | MultiSelectFilterConfig<T>
  | DateFilterConfig
  | DateRangeFilterConfig;

export type ColumnFilterType = ColumnFilterConfig["type"];

export type ColumnFilterConfigOf<K extends ColumnFilterType> = Extract<
  ColumnFilterConfig,
  { type: K }
>;

export type FilterControl<TConfig> = ComponentType<FilterControlProps<TConfig>>;

/**
 * Новый тип фильтра: `controls/<Name>FilterControl.tsx` с конфигом и
 * компонентом, конфиг — в `ColumnFilterConfig`, компонент — сюда.
 */
export const FILTER_CONTROLS: {
  [K in ColumnFilterType]: FilterControl<ColumnFilterConfigOf<K>>;
} = {
  text: TextFilterControl,
  faceted: FacetedFilterControl,
  select: SelectFilterControl,
  multiselect: MultiSelectFilterControl,
  date: DateFilterControl,
  daterange: DateRangeFilterControl,
};
