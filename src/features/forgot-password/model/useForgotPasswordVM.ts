import { IMainApi } from "@shared/api";
import { useZodForm } from "@shared/ui";
import { useState } from "react";

import {
  forgotPasswordFormValidationSchema,
  TForgotPasswordForm,
} from "./validation";

export const useForgotPasswordVM = () => {
  const api = IMainApi.useInstance();
  const [sent, setSent] = useState(false);

  const form = useZodForm(forgotPasswordFormValidationSchema);

  const submit = async (data: TForgotPasswordForm) => {
    await api.requestResetPassword({ login: data.login });
    setSent(true);
  };

  return { form, submit, sent };
};
