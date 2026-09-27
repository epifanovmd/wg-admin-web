import { DatePicker } from "../../../../date-picker";
import type { BaseFilterConfig } from "./filter-config";
import type { FilterControlProps } from "./filter-control-props";

export interface DateFilterConfig extends BaseFilterConfig {
  type: "date";
}

export const DateFilterControl = ({
  config,
  column,
}: FilterControlProps<DateFilterConfig>) => (
  <DatePicker
    size="sm"
    clearable
    placeholder={config.placeholder}
    value={column.getFilterValue() as Date | undefined}
    onChange={(date: Date | undefined) => column.setFilterValue(date)}
  />
);
