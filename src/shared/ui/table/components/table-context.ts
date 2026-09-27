import * as React from "react";

import { TABLE_LABELS, type TableLabels } from "../constants";
import type { TableSize, TableVariant } from "../table.types";

export interface TableContextValue {
  size: TableSize;
  variant: TableVariant;
  labels: TableLabels;
}

export const TableContext = React.createContext<TableContextValue>({
  size: "md",
  variant: "default",
  labels: TABLE_LABELS,
});

export const useTableContext = () => React.useContext(TableContext);
