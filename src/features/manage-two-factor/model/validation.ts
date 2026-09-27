import { passwordValidation } from "@entities/auth";
import { refineFormField } from "@shared/lib/validation";
import { z } from "zod";

export const enableTwoFactorSchema = refineFormField(
  z.object({
    currentPassword: z.string().min(1, "Введите текущий пароль."),
    password: passwordValidation,
    confirmPassword: z.string(),
    hint: z.string().trim().max(100).optional(),
  }),
  {
    field: "confirmPassword",
    check: data => data.password === data.confirmPassword,
    message: "Пароли не совпадают.",
  },
);

export const disableTwoFactorSchema = z.object({
  currentPassword: z.string().min(1, "Введите текущий пароль."),
  password: z.string().min(1, "Введите второй пароль."),
});

export type TEnableTwoFactorForm = z.infer<typeof enableTwoFactorSchema>;
export type TDisableTwoFactorForm = z.infer<typeof disableTwoFactorSchema>;
