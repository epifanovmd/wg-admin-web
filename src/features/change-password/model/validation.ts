import { passwordValidation } from "@entities/auth";
import { refineFormField } from "@shared/lib/validation";
import { z } from "zod";

export const changePasswordSchema = refineFormField(
  z.object({
    currentPassword: z.string().min(1, "Введите текущий пароль."),
    newPassword: passwordValidation,
    confirmPassword: z.string(),
  }),
  {
    field: "confirmPassword",
    check: data => data.newPassword === data.confirmPassword,
    message: "Пароли не совпадают.",
  },
);

export type TChangePasswordForm = z.infer<typeof changePasswordSchema>;
