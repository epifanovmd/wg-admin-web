import { z } from "zod";

import { parseJsonText } from "../lib/json";

/** Поле с JSON: пусто или верный JSON. */
export const jsonTextSchema = z.string().superRefine((text, ctx) => {
  const parsed = parseJsonText(text);

  if ("error" in parsed) {
    ctx.addIssue({ code: "custom", message: `Неверный JSON: ${parsed.error}` });
  }
});

/** Необязательная строка: пустая — `undefined`. */
export const optionalTextSchema = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `Не длиннее ${max} символов.`)
    .optional()
    .transform(value => value || undefined);
