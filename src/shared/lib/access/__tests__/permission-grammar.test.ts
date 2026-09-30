import { describe, expect, it } from "vitest";

import { hasPermission, ownPermission, scopeIn } from "../permission-grammar";

describe("hasPermission", () => {
  it("точное право, wildcard и полный доступ", () => {
    expect(hasPermission(["wg:peer:create"], "wg:peer:create")).toBe(true);
    expect(hasPermission(["wg:peer:*"], "wg:peer:create")).toBe(true);
    expect(hasPermission(["wg:*"], "wg:peer:create")).toBe(true);
    expect(hasPermission(["*"], "wg:peer:create")).toBe(true);
    expect(hasPermission(["wg:peer:view"], "wg:peer:create")).toBe(false);
  });

  it("право на все покрывает «только свои», но не наоборот", () => {
    expect(hasPermission(["wg:peer:update"], "wg:peer:update:own")).toBe(true);
    expect(hasPermission(["wg:peer:*"], "wg:peer:update:own")).toBe(true);
    expect(hasPermission(["wg:peer:update:own"], "wg:peer:update")).toBe(false);
    expect(hasPermission(["wg:peer:view"], "wg:peer:update:own")).toBe(false);
  });
});

describe("scopeIn", () => {
  it("all, own или null", () => {
    expect(scopeIn(["x:update"], "x:update")).toBe("all");
    expect(scopeIn([ownPermission("x:update")], "x:update")).toBe("own");
    expect(scopeIn(["x:view"], "x:update")).toBe(null);
  });
});
