import {
  type ColumnDef,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { TablePagination } from "../pagination";

interface Item {
  id: string;
}

const COLUMNS: ColumnDef<Item, string>[] = [
  { accessorKey: "id", header: "ID" },
];

const PaginatedTable = ({ data }: { data: Item[] }) => {
  const table = useReactTable({
    data,
    columns: COLUMNS,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return <TablePagination table={table} />;
};

describe("TablePagination", () => {
  it("для пустой таблицы показывает «Страница 1 из 1», а не «из 0»", () => {
    render(<PaginatedTable data={[]} />);

    expect(screen.getByText("Страница 1 из 1")).toBeInTheDocument();
  });

  it("считает страницы по данным", () => {
    const data = Array.from({ length: 25 }, (_, i) => ({ id: String(i) }));

    render(<PaginatedTable data={data} />);

    expect(screen.getByText("Страница 1 из 3")).toBeInTheDocument();
  });
});
