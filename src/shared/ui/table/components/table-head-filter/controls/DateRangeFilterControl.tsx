import type { DateRange } from "../../../../date-picker";
import { DateRangePicker } from "../../../../date-picker";
import type { BaseFilterConfig } from "./filter-config";
import type { FilterControlProps } from "./filter-control-props";

export interface DateRangeFilterConfig extends BaseFilterConfig {
  type: "daterange";
}

export const DateRangeFilterControl = ({
  config,
  column,
}: FilterControlProps<DateRangeFilterConfig>) => (
  <DateRangePicker
    size="sm"
    clearable
    placeholder={config.placeholder}
    value={column.getFilterValue() as DateRange | undefined}
    onChange={(range: DateRange | undefined) => column.setFilterValue(range)}
  />
);
