import { describe, expect, it } from "vitest";

import {
  byteAxisDomain,
  formatLoad,
  formatPercent,
  formatRate,
  formatSize,
  formatUsage,
  usagePercent,
} from "../format";

describe("agent format", () => {
  it("байты: от байт до терабайт, пусто — прочерк", () => {
    expect(formatSize(0)).toBe("0 Б");
    expect(formatSize(512)).toBe("512 Б");
    expect(formatSize(1536)).toBe("1.5 КБ");
    expect(formatSize(1.4 * 1024 ** 3)).toBe("1.40 ГБ");
    expect(formatSize(2 * 1024 ** 4)).toBe("2.00 ТБ");
    expect(formatSize(undefined)).toBe("—");
    expect(formatRate(2048)).toBe("2.0 КБ/с");
  });

  it("проценты и доля занятого", () => {
    expect(formatPercent(42.6)).toBe("43%");
    expect(usagePercent(1, 4)).toBe(25);
    expect(usagePercent(1, 0)).toBeNull();
    expect(formatUsage(1024, 4096)).toBe("1.0 КБ из 4.0 КБ");
    expect(formatUsage(undefined, 4096)).toBe("—");
  });

  it("средняя нагрузка", () => {
    expect(formatLoad({ load1: 0.5, load5: 0.25 })).toBe("0.50 / 0.25 / —");
    expect(formatLoad({})).toBe("—");
  });

  it("ось байтов: почти ноль — до 1 КБ", () => {
    expect(byteAxisDomain([0, 10])).toEqual([0, 1024]);
    expect(byteAxisDomain([0, 4096])).toBeUndefined();
  });
});
