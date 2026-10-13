import { parseJsonText } from "@entities/agent";
import { z } from "zod";

/** Как задать аргументы: формой по схеме команды или JSON. */
export const ARGS_MODES = [
  { value: "form", label: "Форма" },
  { value: "json", label: "JSON" },
] as const;

export type TArgsMode = (typeof ARGS_MODES)[number]["value"];

/** Срок ответа воркера, с: не больше суток. */
export const MAX_TIMEOUT_SEC = 86_400;

export const workerCommandSchema = z
  .object({
    worker: z.string().min(1, "Выберите воркер."),
    /** Команда из манифеста воркера: другие агент не пропустит. */
    type: z.string().min(1, "Выберите команду."),
    argsMode: z.enum(["form", "json"]),
    /** Поля формы по схеме команды — строки (`schemaFormBody`). */
    fields: z.record(z.string(), z.string().nullable().optional()),
    args: z.string(),
    timeoutSec: z
      .number()
      .int()
      .min(1, "Не меньше секунды.")
      .max(MAX_TIMEOUT_SEC, "Не больше суток.")
      .nullable(),
  })
  .superRefine((form, ctx) => {
    if (form.argsMode !== "json" || !form.args.trim()) return;
    const parsed = parseJsonText(form.args);

    if ("error" in parsed) {
      ctx.addIssue({
        code: "custom",
        path: ["args"],
        message: `Неверный JSON: ${parsed.error}`,
      });
    }
  });

export type TWorkerCommandForm = z.input<typeof workerCommandSchema>;
