import type { ColumnDef, ColumnSizingState } from "@tanstack/react-table";
import { fireEvent, render, screen } from "@testing-library/react";
import * as React from "react";
import { describe, expect, it, vi } from "vitest";

import {
  useColumnPinningFeature,
  useColumnSizingFeature,
  useExpandingFeature,
  useGroupingFeature,
  useInfiniteScrollFeature,
  useRowSelectionFeature,
} from "../hooks";
import { Table } from "../Table";

interface Person {
  id: string;
  name: string;
}

const DATA: Person[] = [
  { id: "1", name: "Анна" },
  { id: "2", name: "Борис" },
];

const COLUMNS: ColumnDef<Person, string>[] = [
  { accessorKey: "id", header: "ID", size: 80 },
  { accessorKey: "name", header: "Имя", size: 200 },
];

const InfiniteTable = ({ loading }: { loading: boolean }) => {
  const infiniteScroll = useInfiniteScrollFeature<Person>({
    hasNextPage: true,
    isFetchingNextPage: false,
    onLoadMore: () => {},
  });
  const features = React.useMemo(() => [infiniteScroll], [infiniteScroll]);

  return (
    <Table
      data={DATA}
      columns={COLUMNS}
      features={features}
      loading={loading}
    />
  );
};

const PinnedTable = () => {
  const pinning = useColumnPinningFeature<Person>({
    defaultColumnPinning: { left: ["id"] },
  });
  const features = React.useMemo(() => [pinning], [pinning]);

  return <Table data={DATA} columns={COLUMNS} features={features} />;
};

const SizedTable = ({ sizing }: { sizing: ColumnSizingState }) => {
  const sizingFeature = useColumnSizingFeature<Person>({
    columnSizingState: sizing,
    onColumnSizingChange: () => {},
  });
  const features = React.useMemo(() => [sizingFeature], [sizingFeature]);

  return <Table data={DATA} columns={COLUMNS} features={features} />;
};

const SelectableTable = () => {
  const selection = useRowSelectionFeature<Person>({ mode: "multi" });
  const features = React.useMemo(() => [selection], [selection]);

  return <Table data={DATA} columns={COLUMNS} features={features} />;
};

const renderDetails = ({ row }: { row: { original: Person } }) => (
  <span>Детали {row.original.name}</span>
);

const ExpandableTable = () => {
  const expanding = useExpandingFeature<Person>({
    renderSubComponent: renderDetails,
  });
  const features = React.useMemo(() => [expanding], [expanding]);

  return <Table data={DATA} columns={COLUMNS} features={features} />;
};

interface Employee {
  id: string;
  name: string;
  team: string;
}

const EMPLOYEES: Employee[] = [
  { id: "1", name: "Анна", team: "Backend" },
  { id: "2", name: "Борис", team: "Backend" },
  { id: "3", name: "Вера", team: "Frontend" },
];

const EMPLOYEE_COLUMNS: ColumnDef<Employee, string>[] = [
  { accessorKey: "team", header: "Команда" },
  { accessorKey: "name", header: "Имя" },
];

const GroupedTable = () => {
  const grouping = useGroupingFeature<Employee>({
    defaultGrouping: ["team"],
  });
  const features = React.useMemo(() => [grouping], [grouping]);

  return (
    <Table data={EMPLOYEES} columns={EMPLOYEE_COLUMNS} features={features} />
  );
};

describe("Table", () => {
  it("закреплённая ячейка шапки остаётся sticky", () => {
    render(<PinnedTable />);

    const th = screen.getByRole("columnheader", { name: "ID" });

    expect(th.style.position).toBe("sticky");
  });

  it("sticky-шапка использует валидный токен тени", () => {
    const { container } = render(
      <Table data={DATA} columns={COLUMNS} stickyHeader />,
    );

    const thead = container.querySelector("thead");

    expect(thead?.className).not.toContain("hsl(var(");
    expect(thead?.className).toContain(
      "shadow-[0_1px_0_0_var(--color-border)]",
    );
  });

  it("ширина ячеек строки обновляется при изменении column sizing", () => {
    const { rerender } = render(<SizedTable sizing={{}} />);

    const cellBefore = screen.getByRole("cell", { name: "Анна" });

    expect(cellBefore.style.width).toBe("200px");

    rerender(<SizedTable sizing={{ name: 320 }} />);

    const cellAfter = screen.getByRole("cell", { name: "Анна" });

    expect(cellAfter.style.width).toBe("320px");
  });

  it("показывает русскую надпись пустого состояния", () => {
    render(<Table data={[]} columns={COLUMNS} />);

    expect(screen.getByText("Нет данных")).toBeInTheDocument();
  });

  it("помечает tbody как aria-busy при загрузке и обновлении", () => {
    const { container, rerender } = render(
      <Table data={DATA} columns={COLUMNS} loading />,
    );

    expect(container.querySelector("tbody")).toHaveAttribute(
      "aria-busy",
      "true",
    );

    rerender(<Table data={DATA} columns={COLUMNS} refreshing />);

    expect(container.querySelector("tbody")).toHaveAttribute(
      "aria-busy",
      "true",
    );

    rerender(<Table data={DATA} columns={COLUMNS} />);

    expect(container.querySelector("tbody")).not.toHaveAttribute("aria-busy");
  });

  it("показывает состояние ошибки вместо данных", () => {
    render(<Table data={DATA} columns={COLUMNS} error />);

    expect(screen.getByText("Не удалось загрузить данные")).toBeInTheDocument();
    expect(screen.queryByText("Анна")).not.toBeInTheDocument();
  });

  it("рендерит toolbar-слот и применяет className к корню", () => {
    const { container } = render(
      <Table
        data={DATA}
        columns={COLUMNS}
        className="root-class"
        toolbar={<span>Панель</span>}
      />,
    );

    expect(container.firstElementChild).toHaveClass("root-class");
    expect(screen.getByText("Панель")).toBeInTheDocument();
  });

  it("строка с onRowClick доступна с клавиатуры", () => {
    const onRowClick = vi.fn();

    render(<Table data={DATA} columns={COLUMNS} onRowClick={onRowClick} />);

    const row = screen.getByRole("cell", { name: "Анна" }).closest("tr")!;

    expect(row).toHaveAttribute("tabindex", "0");

    fireEvent.keyDown(row, { key: "Enter" });

    expect(onRowClick).toHaveBeenCalledWith(DATA[0], expect.anything());
  });

  it("передаёт выбор строки через чекбокс, без aria-selected на tr", () => {
    render(<SelectableTable />);

    const selectAll = screen.getByRole("checkbox", { name: "Выбрать все" });
    const rowCheckboxes = screen.getAllByRole("checkbox", {
      name: "Выбрать строку",
    });

    expect(selectAll).toBeInTheDocument();
    expect(rowCheckboxes).toHaveLength(2);

    fireEvent.click(rowCheckboxes[0]!);

    const row = rowCheckboxes[0]!.closest("tr")!;

    expect(rowCheckboxes[0]).toBeChecked();
    expect(row).toHaveAttribute("data-state", "selected");
    expect(row).not.toHaveAttribute("aria-selected");
  });

  it("прокидывает getRowProps на строку", () => {
    render(
      <Table
        data={DATA}
        columns={COLUMNS}
        getRowProps={row => ({ "data-row-id": row.original.id })}
      />,
    );

    const row = screen.getByRole("cell", { name: "Анна" }).closest("tr");

    expect(row).toHaveAttribute("data-row-id", "1");
  });
});

describe("Table expanding", () => {
  it("обновляет aria-expanded переключателя после раскрытия строки", () => {
    render(<ExpandableTable />);

    const [toggle] = screen.getAllByRole("button", {
      name: "Развернуть строку",
    });

    expect(toggle).toHaveAttribute("aria-expanded", "false");

    fireEvent.click(toggle!);

    expect(screen.getByText("Детали Анна")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Свернуть строку" }),
    ).toHaveAttribute("aria-expanded", "true");
  });
});

describe("Table grouping", () => {
  it("раскрывает сгруппированную строку по клику на переключатель", () => {
    render(<GroupedTable />);

    expect(screen.queryByText("Анна")).not.toBeInTheDocument();

    const [toggle] = screen.getAllByRole("button", {
      name: "Развернуть строку",
    });

    expect(toggle).toHaveAttribute("aria-expanded", "false");

    fireEvent.click(toggle!);

    expect(screen.getByText("Анна")).toBeInTheDocument();
    expect(screen.getByText("Борис")).toBeInTheDocument();
    expect(screen.queryByText("Вера")).not.toBeInTheDocument();
  });

  it("подключает наблюдатель подгрузки, когда первая загрузка завершилась", () => {
    const observe = vi.fn();

    class IntersectionObserverMock {
      observe = observe;
      disconnect = vi.fn();
      unobserve = vi.fn();
    }

    vi.stubGlobal("IntersectionObserver", IntersectionObserverMock);

    const view = render(<InfiniteTable loading />);

    view.rerender(<InfiniteTable loading={false} />);

    expect(observe).toHaveBeenCalledTimes(1);

    vi.unstubAllGlobals();
  });
});
