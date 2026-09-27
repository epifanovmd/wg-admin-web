import type { ColumnDef, Row } from "@tanstack/react-table";
import { fireEvent, render, screen } from "@testing-library/react";
import * as React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useExpandingFeature, useRowSelectionFeature } from "../hooks";
import { Table } from "../Table";

interface Person {
  id: string;
  name: string;
}

const COLUMNS: ColumnDef<Person, string>[] = [
  { accessorKey: "id", header: "ID" },
  { accessorKey: "name", header: "Имя" },
];

const DATA: Person[] = [
  { id: "1", name: "Анна" },
  { id: "2", name: "Борис" },
  { id: "3", name: "Вера" },
];

const MANY: Person[] = Array.from({ length: 1000 }, (_, i) => ({
  id: String(i + 1),
  name: `Человек ${i + 1}`,
}));

interface BulkTableProps {
  onDelete: (rows: Row<Person>[]) => void;
}

const BulkTable = ({ onDelete }: BulkTableProps) => {
  const selection = useRowSelectionFeature<Person>();
  const features = React.useMemo(() => [selection], [selection]);

  return (
    <Table
      data={DATA}
      columns={COLUMNS}
      features={features}
      getRowId={row => row.id}
      bulkActions={({ rows, clear }) => (
        <button
          type="button"
          onClick={() => {
            onDelete(rows);
            clear();
          }}
        >
          Удалить
        </button>
      )}
    />
  );
};

const renderDetails = ({ row }: { row: Row<Person> }) => (
  <span>Детали {row.original.name}</span>
);

const VirtualExpandableTable = () => {
  const expanding = useExpandingFeature<Person>({
    renderSubComponent: renderDetails,
  });
  const features = React.useMemo(() => [expanding], [expanding]);

  return <Table data={DATA} columns={COLUMNS} features={features} virtual />;
};

describe("Table bulkActions", () => {
  it("показывает панель только при выбранных строках", () => {
    render(<BulkTable onDelete={() => {}} />);

    expect(screen.queryByRole("toolbar")).not.toBeInTheDocument();

    const [first, second] = screen.getAllByRole("checkbox", {
      name: "Выбрать строку",
    });

    fireEvent.click(first!);
    fireEvent.click(second!);

    expect(screen.getByRole("toolbar")).toBeInTheDocument();
    expect(screen.getByText("Выбрано: 2")).toBeInTheDocument();
  });

  it("передаёт выбранные строки и снимает выделение", () => {
    const onDelete = vi.fn();

    render(<BulkTable onDelete={onDelete} />);

    fireEvent.click(
      screen.getAllByRole("checkbox", { name: "Выбрать строку" })[1]!,
    );
    fireEvent.click(screen.getByRole("button", { name: "Удалить" }));

    const rows = onDelete.mock.calls[0]![0] as Row<Person>[];

    expect(rows.map(row => row.original.name)).toEqual(["Борис"]);
    expect(screen.queryByRole("toolbar")).not.toBeInTheDocument();
  });

  it("кнопка «Снять выделение» очищает выбор", () => {
    render(<BulkTable onDelete={() => {}} />);

    fireEvent.click(screen.getByRole("checkbox", { name: "Выбрать все" }));
    expect(screen.getByText("Выбрано: 3")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Снять выделение" }));

    expect(screen.queryByRole("toolbar")).not.toBeInTheDocument();
    expect(
      screen.getAllByRole("checkbox", { name: "Выбрать строку" })[0],
    ).not.toBeChecked();
  });
});

describe("Table virtual", () => {
  const ROW_HEIGHT = 40;
  const VIEWPORT_HEIGHT = 400;

  const originalHeight = Object.getOwnPropertyDescriptor(
    HTMLElement.prototype,
    "offsetHeight",
  );

  beforeEach(() => {
    // jsdom не считает раскладку: строкам и контейнеру задаются размеры явно.
    Object.defineProperty(HTMLElement.prototype, "offsetHeight", {
      configurable: true,
      get(this: HTMLElement) {
        return this.tagName === "TR" ? ROW_HEIGHT : VIEWPORT_HEIGHT;
      },
    });
  });

  afterEach(() => {
    if (originalHeight) {
      Object.defineProperty(
        HTMLElement.prototype,
        "offsetHeight",
        originalHeight,
      );
    }
  });

  it("из 1000 строк рендерит только окно и держит высоту распорками", () => {
    const { container } = render(
      <Table
        data={MANY}
        columns={COLUMNS}
        virtual={{ estimateSize: ROW_HEIGHT, overscan: 5 }}
        stickyHeader
      />,
    );

    const dataRows = container.querySelectorAll("tbody tr[data-index]");

    expect(dataRows.length).toBeGreaterThan(0);
    expect(dataRows.length).toBeLessThan(50);
    expect(screen.getByText("Человек 1")).toBeInTheDocument();
    expect(screen.queryByText("Человек 1000")).not.toBeInTheDocument();

    const spacer = container.querySelector<HTMLElement>(
      "tbody tr[data-virtual-spacer='bottom'] td",
    );

    expect(spacer).not.toBeNull();
    expect(Number.parseFloat(spacer!.style.height)).toBeGreaterThan(
      ROW_HEIGHT * 900,
    );
  });

  it("без virtual рендерит все строки", () => {
    const { container } = render(<Table data={MANY} columns={COLUMNS} />);

    expect(container.querySelectorAll("tbody tr")).toHaveLength(1000);
  });

  it("раскрытая строка виртуализируется вместе с основной", () => {
    render(<VirtualExpandableTable />);

    fireEvent.click(
      screen.getAllByRole("button", { name: "Развернуть строку" })[0]!,
    );

    expect(screen.getByText("Детали Анна")).toBeInTheDocument();
  });
});
