import { createElement, useMemo } from "react";

import type { SelectDataProps, SelectOption } from "../../../../select";
import { useAsyncOptions, useStaticOptions } from "../../../../select";
import { FILTER_DEBOUNCE_MS } from "../../../constants";
import type { ColumnFilterOption } from "./filter-config";
import type { FilterColumn } from "./filter-control-props";
import { FilterOptionLabel } from "./FilterOptionLabel";

export interface UseFilterOptionsConfig {
  column: FilterColumn;
  options?: ColumnFilterOption[];
  fetchOptions?: (query: string) => Promise<ColumnFilterOption[]>;
  /** Дописывать к статическим опциям количество совпадений в текущих данных. */
  faceted?: boolean;
}

const EMPTY_OPTIONS: ColumnFilterOption[] = [];

const fetchNothing = async (): Promise<ColumnFilterOption[]> => EMPTY_OPTIONS;

const identity = (option: ColumnFilterOption): SelectOption<string> => option;

/** Источник опций для select/multiselect-фильтров: статический список или async-поиск. */
export const useFilterOptions = ({
  column,
  options,
  fetchOptions,
  faceted,
}: UseFilterOptionsConfig): SelectDataProps<string> => {
  const uniqueValues = faceted ? column.getFacetedUniqueValues() : undefined;

  const staticOptions = useMemo(() => {
    const source = options ?? EMPTY_OPTIONS;

    if (!uniqueValues) return source;

    return source.map(option => ({
      ...option,
      label: createElement(FilterOptionLabel, {
        label: option.label,
        count: uniqueValues.get(option.value) ?? 0,
      }),
    }));
  }, [options, uniqueValues]);

  const staticProps = useStaticOptions(staticOptions, {
    search: !fetchOptions,
  });
  const asyncProps = useAsyncOptions({
    fetch: fetchOptions ?? fetchNothing,
    getOption: identity,
    debounce: FILTER_DEBOUNCE_MS,
    minQueryLength: 2,
    fetchOnMount: true,
    enabled: !!fetchOptions,
  });

  return fetchOptions ? asyncProps : staticProps;
};
