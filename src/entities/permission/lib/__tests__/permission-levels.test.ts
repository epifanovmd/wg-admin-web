import type { IPermissionCatalogGroupDto } from "@shared/api/gen/main/model";
import { describe, expect, it } from "vitest";

import { applyPreset, levelOf, setLevel } from "../permission-levels";

const group: IPermissionCatalogGroupDto = {
  key: "wg:peer",
  label: "Пиры",
  permissions: [
    { name: "wg:peer:view", label: "Просмотр", own: "wg:peer:view:own" },
    { name: "wg:peer:create", label: "Создание" },
    { name: "wg:peer:update", label: "Изменение", own: "wg:peer:update:own" },
    { name: "wg:peer:delete", label: "Удаление", own: "wg:peer:delete:own" },
  ],
};
const [view, create, update, remove] = group.permissions;
const sorted = (list: string[]) => [...list].sort();

describe("levelOf", () => {
  it("явный уровень: все, свои, нет", () => {
    expect(levelOf(["wg:peer:view"], view)).toEqual({
      level: "all",
      inherited: false,
    });
    expect(levelOf(["wg:peer:view:own"], view)).toEqual({
      level: "own",
      inherited: false,
    });
    expect(levelOf([], view)).toEqual({ level: "none", inherited: false });
  });

  it("wildcard — уровень унаследован", () => {
    expect(levelOf(["wg:peer:*"], update)).toEqual({
      level: "all",
      inherited: true,
    });
    expect(levelOf(["*"], create)).toEqual({ level: "all", inherited: true });
  });
});

describe("setLevel", () => {
  it("заменяет право действия, не трогая остальные", () => {
    expect(
      sorted(setLevel(["x:y", "wg:peer:view"], group, view, "own")),
    ).toEqual(["wg:peer:view:own", "x:y"]);
    expect(setLevel(["wg:peer:view:own"], group, view, "none")).toEqual([]);
  });

  it("действие шире просмотра поднимает просмотр", () => {
    expect(sorted(setLevel([], group, update, "own"))).toEqual([
      "wg:peer:update:own",
      "wg:peer:view:own",
    ]);
    expect(
      sorted(setLevel(["wg:peer:view:own"], group, remove, "all")),
    ).toEqual(["wg:peer:delete", "wg:peer:view"]);
  });

  it("понижение просмотра ограничивает действия группы", () => {
    const next = setLevel(
      [
        "wg:peer:view",
        "wg:peer:update",
        "wg:peer:delete:own",
        "wg:peer:create",
      ],
      group,
      view,
      "own",
    );

    expect(sorted(next)).toEqual([
      "wg:peer:create",
      "wg:peer:delete:own",
      "wg:peer:update:own",
      "wg:peer:view:own",
    ]);
  });

  it("действие без области — вкл/выкл без связи с просмотром", () => {
    expect(setLevel([], group, create, "all")).toEqual(["wg:peer:create"]);
  });
});

describe("applyPreset", () => {
  it("«Всё смотреть — своё менять»", () => {
    expect(sorted(applyPreset(["x:y"], group, "view-all-edit-own"))).toEqual([
      "wg:peer:create",
      "wg:peer:delete:own",
      "wg:peer:update:own",
      "wg:peer:view",
      "x:y",
    ]);
  });

  it("«Только свои», «Просмотр всех», «Нет», «Полный»", () => {
    expect(sorted(applyPreset([], group, "own"))).toEqual([
      "wg:peer:create",
      "wg:peer:delete:own",
      "wg:peer:update:own",
      "wg:peer:view:own",
    ]);
    expect(applyPreset(["wg:peer:update"], group, "view-all")).toEqual([
      "wg:peer:view",
    ]);
    expect(applyPreset(["wg:peer:update", "x:y"], group, "none")).toEqual([
      "x:y",
    ]);
    expect(sorted(applyPreset([], group, "full"))).toEqual([
      "wg:peer:create",
      "wg:peer:delete",
      "wg:peer:update",
      "wg:peer:view",
    ]);
  });
});
