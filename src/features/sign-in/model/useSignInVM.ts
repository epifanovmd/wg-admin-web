import { IAuthStore } from "@entities/auth";
import { useZodForm } from "@shared/ui";
import { useCallback } from "react";

import { signInFormValidationSchema, TSignInForm } from "./validation";

export const useSignInVM = (onSuccess: () => void) => {
  const authStore = IAuthStore.useInstance();

  const form = useZodForm(signInFormValidationSchema, {
    defaultValues: {
      login: "epifanovmd@gmail.com",
      password: "Epifan123",
    },
  });

  const handleLogin = useCallback(
    async (data: TSignInForm) => {
      await authStore.signIn(data);

      if (authStore.isAuthenticated) {
        onSuccess();
      }
    },
    [onSuccess, authStore],
  );

  return {
    form,
    handleLogin,
  };
};
