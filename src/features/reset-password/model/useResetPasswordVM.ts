import { IMainApi } from "@shared/api";
import { useZodForm } from "@shared/ui";
import { useState } from "react";

import {
  resetPasswordFormValidationSchema,
  TResetPasswordForm,
} from "./validation";

interface UseResetPasswordVMOptions {
  token: string;
  onSuccess: () => void;
}

export const useResetPasswordVM = ({
  token,
  onSuccess,
}: UseResetPasswordVMOptions) => {
  const api = IMainApi.useInstance();
  const [error, setError] = useState<string | null>(null);

  const form = useZodForm(resetPasswordFormValidationSchema);

  const submit = async (data: TResetPasswordForm) => {
    setError(null);

    const res = await api.resetPassword({ token, password: data.password });

    if (res.error) {
      setError(res.error.message);
    } else {
      onSuccess();
    }
  };

  return { form, submit, error };
};
