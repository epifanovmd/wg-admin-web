import type { LabeledValue } from "../../../../select";
import { Select } from "../../../../select";
import { useTableContext } from "../../table-context";
import type { BaseFilterConfig, ColumnFilterOption } from "./filter-config";
import type { FilterControlProps } from "./filter-control-props";
import { useFilterOptions } from "./use-filter-options";

export interface SelectFilterConfig<T = string> extends BaseFilterConfig {
  type: "select";
  options?: ColumnFilterOption<T>[];
  fetchOptions?: (query: string) => Promise<ColumnFilterOption<T>[]>;
  labelInValue?: boolean;
  faceted?: boolean;
}

export const SelectFilterControl = ({
  config,
  column,
}: FilterControlProps<SelectFilterConfig>) => {
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
      <Select<string>
        {...dataProps}
        clearable
        labelInValue
        size="sm"
        placeholder={resolvedPlaceholder}
        value={
          (column.getFilterValue() as LabeledValue | null | undefined) ?? null
        }
        onChange={(v: LabeledValue | null) => column.setFilterValue(v)}
      />
    );
  }

  return (
    <Select
      {...dataProps}
      clearable
      size="sm"
      placeholder={resolvedPlaceholder}
      value={(column.getFilterValue() as string | null | undefined) ?? null}
      onChange={(v: string | null) => column.setFilterValue(v)}
    />
  );
};
