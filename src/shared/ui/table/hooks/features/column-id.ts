import type { ColumnDef } from "@tanstack/react-table";

export const getColumnDefId = (
  column: ColumnDef<any, any>,
): string | undefined =>
  column.id ?? (column as { accessorKey?: string }).accessorKey;
