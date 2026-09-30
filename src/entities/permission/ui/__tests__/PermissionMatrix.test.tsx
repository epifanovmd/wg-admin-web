import { iocContainer } from "@shared/lib/di";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { IPermissionCatalogStore } from "../../model/types";
import { PermissionMatrix } from "../PermissionMatrix";

const catalog = {
  groups: [
    {
      key: "wg:peer",
      label: "Пиры",
      permissions: [
        { name: "wg:peer:view", label: "Просмотр", own: "wg:peer:view:own" },
        { name: "wg:peer:create", label: "Создание" },
        {
          name: "wg:peer:update",
          label: "Изменение",
          own: "wg:peer:update:own",
        },
      ],
    },
  ],
  isLoading: false,
  error: null,
  load: vi.fn(),
  labelOf: (name: string) => name,
};

beforeEach(() => {
  iocContainer.bind(IPermissionCatalogStore.Tid).toConstantValue(catalog);
});

afterEach(() => {
  iocContainer.unbind(IPermissionCatalogStore.Tid);
});

describe("PermissionMatrix", () => {
  it("«Свои» у изменения — право :own и просмотр своих", () => {
    const onChange = vi.fn();

    render(<PermissionMatrix value={[]} onChange={onChange} />);

    const update = screen.getByRole("radiogroup", {
      name: "Пиры: Изменение",
    });

    fireEvent.click(within(update).getByRole("radio", { name: "Свои" }));

    expect([...onChange.mock.calls[0][0]].sort()).toEqual([
      "wg:peer:update:own",
      "wg:peer:view:own",
    ]);
  });

  it("действие без области — переключатель", () => {
    const onChange = vi.fn();

    render(<PermissionMatrix value={[]} onChange={onChange} />);
    fireEvent.click(screen.getByRole("switch", { name: "Пиры: Создание" }));

    expect(onChange).toHaveBeenCalledWith(["wg:peer:create"]);
  });

  it("wildcard — уровни унаследованы и заблокированы", () => {
    render(<PermissionMatrix value={["wg:peer:*"]} onChange={vi.fn()} />);

    expect(
      screen.getByRole("switch", { name: "Пиры: Создание" }),
    ).toBeDisabled();
    expect(screen.getAllByText(/через wildcard/)).toHaveLength(3);
  });

  it("шаблон «Всё смотреть — своё менять»", async () => {
    const onChange = vi.fn();

    render(<PermissionMatrix value={[]} onChange={onChange} />);
    fireEvent.keyDown(screen.getByRole("button", { name: /Шаблон/ }), {
      key: "Enter",
    });
    fireEvent.click(
      await screen.findByRole("menuitem", {
        name: "Всё смотреть — своё менять",
      }),
    );

    expect([...onChange.mock.calls[0][0]].sort()).toEqual([
      "wg:peer:create",
      "wg:peer:update:own",
      "wg:peer:view",
    ]);
  });
});
