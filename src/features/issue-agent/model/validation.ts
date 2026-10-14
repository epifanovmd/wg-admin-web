import { z } from "zod";

/** Срок токена по умолчанию — сутки, мин. */
export const DEFAULT_ISSUE_MINUTES = 1440;

/** Выдача агента: имя агента, срок и число регистраций токена, адрес. */
export const issueAgentSchema = z.object({
  name: z
    .string()
    .trim()
    .max(128, "Не длиннее 128 символов")
    .refine(value => !/[\r\n]/.test(value), "Без перевода строки"),
  expiresInMinutes: z
    .number({ error: "Укажите срок" })
    .int()
    .min(5, "Не меньше 5 минут")
    .max(30 * 24 * 60, "Не больше 30 дней"),
  maxUses: z
    .number({ error: "Укажите число" })
    .int()
    .min(1, "Хотя бы одна")
    .max(1000, "Не больше 1000"),
  baseUrl: z
    .url("Полный URL, например https://api.example.com")
    .or(z.literal("")),
});

export type TIssueAgentForm = z.input<typeof issueAgentSchema>;
export type TIssueAgentValues = z.output<typeof issueAgentSchema>;

/** Тело запроса выдачи: пустые поля не отправляются. */
export const issueBody = (data: TIssueAgentValues) => ({
  name: data.name || undefined,
  expiresInMinutes: data.expiresInMinutes,
  baseUrl: data.baseUrl || undefined,
});

/** Подпись платформы архива (`linux/amd64`). */
export const platformLabel = (platform: string): string => {
  const [os, arch] = platform.split("/");
  const system = os === "darwin" ? "macOS" : "Linux";

  return `${system} ${arch === "arm64" ? "ARM64" : "x86-64"}`;
};
