import { useLatestRef } from "@shared/lib/hooks";
import { Search } from "lucide-react";
import * as React from "react";

import { Input } from "../../../../input";
import { FILTER_DEBOUNCE_MS } from "../../../constants";
import { useTableContext } from "../../table-context";
import type { BaseFilterConfig } from "./filter-config";
import type { FilterControlProps } from "./filter-control-props";

export interface TextFilterConfig extends BaseFilterConfig {
  type: "text";
}

const SEARCH_ICON = <Search className="h-3.5 w-3.5" />;

const normalize = (value: string): string | undefined => {
  const trimmed = value.trim();

  return trimmed.length ? trimmed : undefined;
};

export const TextFilterControl = ({
  config,
  column,
}: FilterControlProps<TextFilterConfig>) => {
  const { labels } = useTableContext();
  const external = (column.getFilterValue() as string | undefined) ?? "";
  const [value, setValue] = React.useState(external);
  const columnRef = useLatestRef(column);
  const committedRef = React.useRef(external);
  const timerRef = React.useRef<ReturnType<typeof setTimeout>>(undefined);

  // Внешний сброс (resetColumnFilters, controlled-значение) — синхронизируем
  // инпут; собственные коммиты пропускаем, чтобы не терять ввод пользователя.
  React.useEffect(() => {
    if (external === committedRef.current) return;

    committedRef.current = external;
    clearTimeout(timerRef.current);
    setValue(external);
  }, [external]);

  React.useEffect(() => () => clearTimeout(timerRef.current), []);

  const commit = (next: string) => {
    setValue(next);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      const normalized = normalize(next);

      committedRef.current = normalized ?? "";
      columnRef.current.setFilterValue(normalized);
    }, FILTER_DEBOUNCE_MS);
  };

  return (
    <Input
      size="sm"
      clearable
      leftIcon={SEARCH_ICON}
      placeholder={config.placeholder ?? labels.filterSearch}
      value={value}
      onChange={e => commit(e.target.value)}
      onClear={() => commit("")}
    />
  );
};
