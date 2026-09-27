import { describe, expect, it } from "vitest";

import { joinIds } from "../join-ids";

describe("joinIds", () => {
  it("joins defined ids with a space", () => {
    expect(joinIds("a", undefined, "b", null, "", "c")).toBe("a b c");
  });

  it("returns a single id as is", () => {
    expect(joinIds(undefined, "a")).toBe("a");
  });

  it("returns undefined when there are no ids", () => {
    expect(joinIds()).toBeUndefined();
    expect(joinIds(undefined, null, "")).toBeUndefined();
  });
});
