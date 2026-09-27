import { z } from "zod";

export const newEmailSchema = z.object({
  email: z.string().trim().email("Введите корректный email."),
});

export const emailCodeSchema = z.object({
  code: z.string().trim().min(4, "Введите код из письма."),
});

export type TNewEmailForm = z.infer<typeof newEmailSchema>;
export type TEmailCodeForm = z.infer<typeof emailCodeSchema>;
