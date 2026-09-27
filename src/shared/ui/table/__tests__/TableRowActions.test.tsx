import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { TableRowActions } from "../components/TableRowActions";
import { Table } from "../Table";

interface Row {
  id: string;
  name: string;
}

const DATA: Row[] = [{ id: "1", name: "Анна" }];

describe("TableRowActions", () => {
  it("клик по действию не вызывает onRowClick", () => {
    const onRowClick = vi.fn();
    const onAction = vi.fn();

    render(
      <Table<Row>
        data={DATA}
        columns={[
          { id: "name", header: "Имя", cell: ({ row }) => row.original.name },
          {
            id: "actions",
            cell: () => (
              <TableRowActions>
                <button onClick={onAction}>Действие</button>
              </TableRowActions>
            ),
          },
        ]}
        onRowClick={onRowClick}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Действие" }));
    expect(onAction).toHaveBeenCalledOnce();
    expect(onRowClick).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("cell", { name: "Анна" }));
    expect(onRowClick).toHaveBeenCalledOnce();
  });
});
