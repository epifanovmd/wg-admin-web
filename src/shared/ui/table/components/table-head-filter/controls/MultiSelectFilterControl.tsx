import type { LabeledValue } from "../../../../select";
import { Select } from "../../../../select";
import { useTableContext } from "../../table-context";
import type { BaseFilterConfig, ColumnFilterOption } from "./filter-config";
import type { FilterControlProps } from "./filter-control-props";
import { useFilterOptions } from "./use-filter-options";

export interface MultiSelectFilterConfig<T = string> extends BaseFilterConfig {
  type: "multiselect";
  options?: ColumnFilterOption<T>[];
  fetchOptions?: (query: string) => Promise<ColumnFilterOption<T>[]>;
  labelInValue?: boolean;
  faceted?: boolean;
}

const EMPTY_VALUES: never[] = [];

export const MultiSelectFilterControl = ({
  config,
  column,
}: FilterControlProps<MultiSelectFilterConfig>) => {
  const { labels } = useTableContext();
  const { options, fetchOptions, placeholder, labelInValue, faceted } = config;
  const dataProps = useFilterOptions({
    column,
    options,
    fetchOptions,
    faceted,
  });
  const resolvedPlaceholder = placeholder ?? labels.filterAll;

  if (labelInValue) {
    return (
      <Select
        {...dataProps}
        multi
        clearable
        labelInValue
        size="sm"
        placeholder={resolvedPlaceholder}
        value={
          (column.getFilterValue() as LabeledValue[] | undefined) ??
          EMPTY_VALUES
        }
        onChange={(v: LabeledValue[]) => column.setFilterValue(v)}
      />
    );
  }

  return (
    <Select
      {...dataProps}
      multi
      clearable
      size="sm"
      placeholder={resolvedPlaceholder}
      value={(column.getFilterValue() as string[] | undefined) ?? EMPTY_VALUES}
      onChange={(v: string[]) => column.setFilterValue(v)}
    />
  );
};
