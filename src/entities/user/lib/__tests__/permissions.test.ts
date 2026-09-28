import { describe, expect, it } from "vitest";

import { canAccess, computeEffectivePermissions } from "../permissions";

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

describe("computeEffectivePermissions", () => {
  it("объединение без повторов", () => {
    expect(computeEffectivePermissions(["a:b", "c:d"], ["c:d", "e:f"])).toEqual(
      ["a:b", "c:d", "e:f"],
    );
  });
});
