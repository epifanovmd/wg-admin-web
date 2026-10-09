import { describe, expect, it } from "vitest";

import { parseWgStateResult } from "../state-result";

describe("parseWgStateResult", () => {
  it("интерфейсы со статусом и ошибки применения", () => {
    expect(
      parseWgStateResult({
        version: 7,
        appliedAt: 1000,
        interfaces: [
          { name: "wg0", status: "up" },
          { name: "wg1", status: "error", message: "порт занят" },
          { name: "wg2", status: "strange" },
          { status: "up" },
        ],
        errors: ["wg1: порт занят", 42],
      }),
    ).toEqual({
      version: 7,
      appliedAt: 1000,
      interfaces: [
        { name: "wg0", status: "up", message: null },
        { name: "wg1", status: "error", message: "порт занят" },
        { name: "wg2", status: "unknown", message: null },
      ],
      errors: ["wg1: порт занят"],
    });
  });

  it("не итог воркера wg — null", () => {
    expect(parseWgStateResult(undefined)).toBeNull();
    expect(parseWgStateResult({ proxies: [] })).toBeNull();
    expect(parseWgStateResult([1])).toBeNull();
  });

  it("без версии и времени — null в полях", () => {
    expect(parseWgStateResult({ interfaces: [] })).toEqual({
      version: null,
      appliedAt: null,
      interfaces: [],
      errors: [],
    });
  });
});
