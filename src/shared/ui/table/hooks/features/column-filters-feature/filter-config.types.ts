import type { DateRange } from "../../../../date-picker";
import type { LabeledValue } from "../../../../select";
import type { ColumnFilterConfig } from "../../../table.types";

type UnwrapArray<T> = T extends (infer U)[] ? U : T;

type UnwrapLabeledValue<T> = T extends LabeledValue<infer V> ? V : T;

type FilterFieldValue<TQuery, K extends keyof TQuery> = UnwrapLabeledValue<
  UnwrapArray<NonNullable<TQuery[K]>>
>;

type IsArrayField<TQuery, K extends keyof TQuery> =
  NonNullable<TQuery[K]> extends readonly unknown[] ? true : false;

type IsDateField<TQuery, K extends keyof TQuery> =
  NonNullable<TQuery[K]> extends Date ? true : false;

// Проверяется только после `IsDateField`: у `DateRange` все поля опциональны,
// иначе обычный `Date` структурно подошёл бы и под него.
type IsDateRangeField<TQuery, K extends keyof TQuery> =
  NonNullable<TQuery[K]> extends DateRange ? true : false;

type IsLabeledField<TQuery, K extends keyof TQuery> =
  UnwrapArray<NonNullable<TQuery[K]>> extends LabeledValue<any> ? true : false;

type IsUnknownField<TQuery, K extends keyof TQuery> = unknown extends TQuery[K]
  ? true
  : false;

type LabelInValueFlag<Labeled extends boolean> = Labeled extends true
  ? { labelInValue: true }
  : { labelInValue?: false };

type TextConfig = Extract<ColumnFilterConfig, { type: "text" }>;

type FacetedConfig = Extract<ColumnFilterConfig, { type: "faceted" }>;

type SelectConfig<T> = Omit<
  Extract<ColumnFilterConfig<T>, { type: "select" }>,
  "labelInValue"
>;

type MultiSelectConfig<T> = Omit<
  Extract<ColumnFilterConfig<T>, { type: "multiselect" }>,
  "labelInValue"
>;

type DateConfig = Extract<ColumnFilterConfig, { type: "date" }>;

type DateRangeConfig = Extract<ColumnFilterConfig, { type: "daterange" }>;

type ScalarFilterConfig<T, Labeled extends boolean> = Labeled extends true
  ? SelectConfig<T> & { labelInValue: true }
  : TextConfig | FacetedConfig | (SelectConfig<T> & { labelInValue?: false });

type ArrayFilterConfig<T, Labeled extends boolean> = MultiSelectConfig<T> &
  LabelInValueFlag<Labeled>;

type AnyFilterConfig<T> =
  | TextConfig
  | FacetedConfig
  | (SelectConfig<T> & { labelInValue?: boolean })
  | (MultiSelectConfig<T> & { labelInValue?: boolean })
  | DateConfig
  | DateRangeConfig;

type QueryFilterConfig<TQuery, K extends keyof TQuery & string> = {
  queryKey: K;
} & (IsUnknownField<TQuery, K> extends true
  ? AnyFilterConfig<FilterFieldValue<TQuery, K>>
  : IsDateField<TQuery, K> extends true
    ? DateConfig
    : IsDateRangeField<TQuery, K> extends true
      ? DateRangeConfig
      : IsArrayField<TQuery, K> extends true
        ? ArrayFilterConfig<
            FilterFieldValue<TQuery, K>,
            IsLabeledField<TQuery, K>
          >
        : ScalarFilterConfig<
            FilterFieldValue<TQuery, K>,
            IsLabeledField<TQuery, K>
          >);

export type TableFilterFieldConfig<TQuery> = {
  [K in keyof TQuery & string]: QueryFilterConfig<TQuery, K>;
}[keyof TQuery & string];

export type TableFiltersConfig<TData, TQuery> = {
  [K in keyof TData & string]?: TableFilterFieldConfig<TQuery>;
};
