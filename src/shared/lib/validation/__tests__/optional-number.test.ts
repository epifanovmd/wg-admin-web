import { describe, expect, it } from "vitest";
import { z } from "zod";

import { optionalNumber } from "../optional-number";
import { applyZodLocale } from "../zod-locale";

describe("optionalNumber", () => {
  const schema = z.object({ mtu: optionalNumber(z.number().int().min(1280)) });

  it("пустое поле (null) и отсутствие значения — допустимы", () => {
    expect(schema.safeParse({ mtu: null }).success).toBe(true);
    expect(schema.safeParse({}).success).toBe(true);
  });

  it("ограничения исходной схемы работают", () => {
    expect(schema.safeParse({ mtu: 1000 }).success).toBe(false);
    expect(schema.safeParse({ mtu: 1420 }).success).toBe(true);
  });
});

describe("applyZodLocale", () => {
  it("стандартные сообщения — на русском", () => {
    applyZodLocale();

    const message = z.number().safeParse(null).error?.issues[0].message ?? "";

    expect(message).toMatch(/[а-яё]/i);
    expect(message).not.toMatch(/Invalid input/);
  });
});
