import { describe, expect, it } from "vitest";

import {
  canAccess,
  computeEffectivePermissions,
  isOwnedBy,
  resolveScope,
} from "../permissions";

describe("canAccess", () => {
  it("точное право, wildcard домена и полный доступ", () => {
    expect(canAccess([], ["wg:peer:create"], "wg:peer:create")).toBe(true);
    expect(canAccess([], ["wg:peer:*"], "wg:peer:create")).toBe(true);
    expect(canAccess([], ["wg:*"], "wg:peer:create")).toBe(true);
    expect(canAccess([], ["*"], "wg:peer:create")).toBe(true);
    expect(canAccess([], ["wg:peer:view"], "wg:peer:create")).toBe(false);
  });

  it("роль admin — любой доступ", () => {
    expect(canAccess(["admin"], [], "user:delete")).toBe(true);
  });
});

describe("resolveScope", () => {
  it("admin — на все; иначе по набору прав", () => {
    expect(resolveScope(["admin"], [], "wg:peer:update")).toBe("all");
    expect(resolveScope([], ["wg:peer:update:own"], "wg:peer:update")).toBe(
      "own",
    );
    expect(resolveScope([], [], "wg:peer:update")).toBe(null);
  });
});

describe("isOwnedBy", () => {
  it("пользователь среди владельцев", () => {
    expect(isOwnedBy("u1", [null, "u1"])).toBe(true);
    expect(isOwnedBy("u1", ["u2", null])).toBe(false);
    expect(isOwnedBy(undefined, [undefined])).toBe(false);
  });
});

describe("computeEffectivePermissions", () => {
  it("объединение без повторов", () => {
    expect(computeEffectivePermissions(["a:b", "c:d"], ["c:d", "e:f"])).toEqual(
      ["a:b", "c:d", "e:f"],
    );
  });
});
