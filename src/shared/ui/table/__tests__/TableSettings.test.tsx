import type { ColumnDef } from "@tanstack/react-table";
import {
  act,
  fireEvent,
  render,
  renderHook,
  screen,
} from "@testing-library/react";
import * as React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { type TableSettings, useTableSettings } from "../hooks";
import { Table } from "../Table";
import { createLocalStorageTableSettings } from "../utils";

interface Person {
  id: string;
  name: string;
}

const DATA: Person[] = [{ id: "1", name: "Анна" }];

const COLUMNS: ColumnDef<Person, string>[] = [
  { accessorKey: "id", header: "ID", meta: { label: "ID" } },
  { accessorKey: "name", header: "Имя", meta: { label: "Имя" } },
];

interface SettingsTableProps {
  onChange: (settings: TableSettings) => void;
  defaultValue?: TableSettings;
}

const SettingsTable = ({ onChange, defaultValue }: SettingsTableProps) => {
  const { features } = useTableSettings<Person>({ defaultValue, onChange });

  return (
    <Table
      data={DATA}
      columns={COLUMNS}
      features={features}
      showColumnVisibility
    />
  );
};

describe("useTableSettings", () => {
  it("собирает четыре фичи колонок и применяет начальные настройки", () => {
    render(
      <SettingsTable
        onChange={() => {}}
        defaultValue={{ columnVisibility: { name: false } }}
      />,
    );

    expect(screen.getByRole("columnheader", { name: "ID" })).toBeVisible();
    expect(
      screen.queryByRole("columnheader", { name: "Имя" }),
    ).not.toBeInTheDocument();
  });

  it("сообщает об изменении видимости целым снимком настроек", () => {
    const onChange = vi.fn();

    render(<SettingsTable onChange={onChange} />);

    fireEvent.click(
      screen.getByRole("button", { name: "Показать/скрыть колонки" }),
    );
    fireEvent.click(screen.getByRole("checkbox", { name: "Имя" }));

    expect(onChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ columnVisibility: { name: false } }),
    );
  });

  it("принимает ленивое начальное значение и сбрасывает его через reset", () => {
    const load = vi.fn(() => ({ columnOrder: ["name", "id"] }));
    const { result } = renderHook(() =>
      useTableSettings({ defaultValue: load }),
    );

    expect(load).toHaveBeenCalledTimes(1);
    expect(result.current.settings.columnOrder).toEqual(["name", "id"]);
    expect(result.current.features.map(feature => feature.kind)).toEqual([
      "columnVisibility",
      "columnOrder",
      "columnSizing",
      "columnPinning",
    ]);

    act(() => result.current.setSettings({ columnSizing: { id: 120 } }));
    expect(result.current.settings).toEqual({ columnSizing: { id: 120 } });

    act(() => result.current.reset());
    expect(result.current.settings).toEqual({});
  });

  it("parts ограничивает набор фич", () => {
    const { result } = renderHook(() =>
      useTableSettings({ parts: ["columnVisibility"] }),
    );

    expect(result.current.features.map(feature => feature.kind)).toEqual([
      "columnVisibility",
    ]);
  });
});

describe("createLocalStorageTableSettings", () => {
  afterEach(() => {
    localStorage.clear();
  });

  it("сохраняет и читает настройки", () => {
    const storage = createLocalStorageTableSettings("orders");

    storage.save({ columnVisibility: { id: false } });

    expect(storage.load()).toEqual({ columnVisibility: { id: false } });

    storage.clear();
    expect(storage.load()).toBeUndefined();
  });

  it("игнорирует повреждённые данные и ошибки хранилища", () => {
    const storage = createLocalStorageTableSettings("orders");

    localStorage.setItem("orders", "{битый json");
    expect(storage.load()).toBeUndefined();

    localStorage.setItem("orders", "[1,2]");
    expect(storage.load()).toBeUndefined();

    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("QuotaExceededError");
    });
    expect(() => storage.save({})).not.toThrow();
  });
});
