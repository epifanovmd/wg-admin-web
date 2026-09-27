import { IAuthStore } from "@entities/auth";
import { isEmail, isPhone } from "@shared/lib/utils";
import { useZodForm } from "@shared/ui";
import { useCallback } from "react";

import { signUpFormValidationSchema, TSignUpForm } from "./validation";

export const useSignUpVM = (onSuccess: () => void) => {
  const authStore = IAuthStore.useInstance();

  const form = useZodForm(signUpFormValidationSchema, {
    defaultValues: {},
  });

  const handleSignUp = useCallback(
    async (data: TSignUpForm) => {
      const email = isEmail(data.login) ? data.login : undefined;
      const phone = isPhone(data.login) ? data.login : undefined;

      if (email) {
        await authStore.signUp({
          email,
          password: data.password,
          firstName: data.firstName,
          lastName: data.lastName,
        });
      } else if (phone) {
        await authStore.signUp({
          phone,
          password: data.password,
          firstName: data.firstName,
          lastName: data.lastName,
        });
      }

      if (authStore.isAuthenticated) {
        onSuccess();
      }
    },
    [onSuccess, authStore],
  );

  return {
    form,
    handleSignUp,
  };
};
