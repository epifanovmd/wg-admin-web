import { loginValidation, passwordValidation } from "@entities/auth";
import { refineFormField } from "@shared/lib/validation";
import { z } from "zod";

const signUpFormBaseSchema = z.object({
  login: loginValidation,
  password: passwordValidation,
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  confirmPassword: passwordValidation,
});

export const signUpFormValidationSchema = refineFormField(
  signUpFormBaseSchema,
  {
    field: "confirmPassword",
    check: data => data.password === data.confirmPassword,
    message: "Пароли не совпадают.",
  },
);

export type TSignUpForm = z.infer<typeof signUpFormValidationSchema>;
