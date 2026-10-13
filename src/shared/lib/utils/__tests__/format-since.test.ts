import { describe, expect, it } from "vitest";

import { formatSince, sinceTickMs } from "../format-since";

const NOW = 10_000_000_000;

describe("formatSince", () => {
  it("секунды, минуты, часы, дни; будущее — только что", () => {
    expect(formatSince(NOW - 500, NOW)).toBe("только что");
    expect(formatSince(NOW + 5000, NOW)).toBe("только что");
    expect(formatSince(NOW - 3_400, NOW)).toBe("3 с назад");
    expect(formatSince(NOW - 125_000, NOW)).toBe("2 мин назад");
    expect(formatSince(NOW - 3 * 3_600_000, NOW)).toBe("3 ч назад");
    expect(formatSince(NOW - 50 * 3_600_000, NOW)).toBe("2 д назад");
  });
});

describe("sinceTickMs", () => {
  it("в первую минуту — каждую секунду, дальше реже", () => {
    expect(sinceTickMs(NOW - 10_000, NOW)).toBe(1000);
    expect(sinceTickMs(NOW - 120_000, NOW)).toBe(15_000);
    expect(sinceTickMs(NOW - 2 * 3_600_000, NOW)).toBe(60_000);
  });
});
