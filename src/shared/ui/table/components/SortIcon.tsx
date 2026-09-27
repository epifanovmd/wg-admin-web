import type { SortDirection } from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";

interface SortIconProps {
  direction: SortDirection | false;
}

export const SortIcon = ({ direction }: SortIconProps) => {
  if (direction === "asc") return <ArrowUp className="h-3.5 w-3.5 shrink-0" />;
  if (direction === "desc")
    return <ArrowDown className="h-3.5 w-3.5 shrink-0" />;

  return <ArrowUpDown className="h-3.5 w-3.5 shrink-0 opacity-40" />;
};
