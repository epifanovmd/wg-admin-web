import { describe, expect, it } from "vitest";

import { formatBytes } from "../format-bytes";
import { formatDuration } from "../format-duration";

describe("formatBytes", () => {
  it("picks the unit by size", () => {
    expect(formatBytes(0)).toBe("0 Б");
    expect(formatBytes(512)).toBe("512 Б");
    expect(formatBytes(300 * 1024)).toBe("300.0 КБ");
    expect(formatBytes(12.3 * 1024 * 1024)).toBe("12.3 МБ");
    expect(formatBytes(1.4 * 1024 ** 3)).toBe("1.40 ГБ");
    expect(formatBytes(1.4 * 1024 ** 4)).toBe("1.40 ТБ");
  });
});

describe("formatDuration", () => {
  it("formats hours, minutes and seconds", () => {
    expect(formatDuration(45)).toBe("45 с");
    expect(formatDuration(200)).toBe("3 мин 20 с");
    expect(formatDuration(7500)).toBe("2 ч 5 мин");
    expect(formatDuration(86_400)).toBe("1 д 0 ч");
    expect(formatDuration(2 * 86_400 + 5 * 3_600 + 120)).toBe("2 д 5 ч");
  });

  it("shows a dash for missing values", () => {
    expect(formatDuration(null)).toBe("—");
    expect(formatDuration(undefined)).toBe("—");
  });
});
