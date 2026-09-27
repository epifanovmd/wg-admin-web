import { IMainApi } from "@shared/api";
import { notifyApiError } from "@shared/lib/http";
import { INotificationService } from "@shared/lib/notifications";
import { useZodForm } from "@shared/ui";
import { useState } from "react";

import {
  disableTwoFactorSchema,
  enableTwoFactorSchema,
  TDisableTwoFactorForm,
  TEnableTwoFactorForm,
} from "./validation";

export type TwoFactorMode = "enable" | "disable";

/**
 * Двухфакторная защита — второй пароль при входе. Сервер не сообщает,
 * включена ли она, поэтому экран предлагает оба действия.
 */
export const useTwoFactorVM = () => {
  const api = IMainApi.useInstance();
  const toast = INotificationService.useInstance();
  const [mode, setMode] = useState<TwoFactorMode>("enable");

  const enableForm = useZodForm(enableTwoFactorSchema, {
    defaultValues: {
      currentPassword: "",
      password: "",
      confirmPassword: "",
      hint: "",
    },
  });
  const disableForm = useZodForm(disableTwoFactorSchema, {
    defaultValues: { currentPassword: "", password: "" },
  });

  const enable = async (data: TEnableTwoFactorForm) => {
    const res = await api.enable2FA({
      currentPassword: data.currentPassword,
      password: data.password,
      hint: data.hint || undefined,
    });

    if (res.error) {
      notifyApiError(toast, res.error);

      return;
    }

    enableForm.reset();
    toast.success("Двухфакторная защита включена");
  };

  const disable = async (data: TDisableTwoFactorForm) => {
    const res = await api.disable2FA(data);

    if (res.error) {
      notifyApiError(toast, res.error);

      return;
    }

    disableForm.reset();
    toast.success("Двухфакторная защита отключена");
  };

  return { mode, setMode, enableForm, disableForm, enable, disable };
};
