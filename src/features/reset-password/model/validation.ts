import { refineFormField } from "@shared/lib/validation";
import { z } from "zod";

const resetPasswordFormBaseSchema = z.object({
  password: z.string().min(6, "Пароль должен содержать минимум 6 символов"),
  confirmPassword: z.string().min(1, "Подтвердите пароль"),
});

export const resetPasswordFormValidationSchema = refineFormField(
  resetPasswordFormBaseSchema,
  {
    field: "confirmPassword",
    check: data => data.password === data.confirmPassword,
    message: "Пароли не совпадают",
  },
);

export type TResetPasswordForm = z.infer<
  typeof resetPasswordFormValidationSchema
>;
