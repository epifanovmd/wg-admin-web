import type { ReactNode } from "react";

interface FilterOptionLabelProps {
  label: ReactNode;
  count: number;
}

/** Подпись опции фильтра с количеством совпадений в текущих данных. */
export const FilterOptionLabel = ({ label, count }: FilterOptionLabelProps) => (
  <span className="flex gap-1">
    {label}
    <span className="text-muted-foreground">({count})</span>
  </span>
);
