import { z } from "zod";

export const forgotPasswordFormValidationSchema = z.object({
  login: z.string().min(1, "Email или телефон обязателен"),
});

export type TForgotPasswordForm = z.infer<
  typeof forgotPasswordFormValidationSchema
>;
