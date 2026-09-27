import { useMemo } from "react";

import { Select } from "../../../../select";
import { useTableContext } from "../../table-context";
import type { BaseFilterConfig } from "./filter-config";
import type { FilterControlProps } from "./filter-control-props";

/** Одиночный выбор из уникальных значений колонки в текущих данных. */
export interface FacetedFilterConfig extends BaseFilterConfig {
  type: "faceted";
}

export const FacetedFilterControl = ({
  config,
  column,
}: FilterControlProps<FacetedFilterConfig>) => {
  const { labels } = useTableContext();
  const uniqueValues = column.getFacetedUniqueValues();
  const currentValue = column.getFilterValue() as string | null | undefined;

  const options = useMemo(
    () =>
      Array.from(uniqueValues.entries())
        .filter(([, count]) => count > 0)
        .map(([value]) => ({ value: String(value), label: String(value) }))
        .sort((a, b) => a.label.localeCompare(b.label)),
    [uniqueValues],
  );

  return (
    <Select
      clearable
      size="sm"
      search
      placeholder={config.placeholder ?? labels.filterAll}
      options={options}
      value={currentValue ?? null}
      onChange={(v: string | null) => column.setFilterValue(v)}
    />
  );
};
