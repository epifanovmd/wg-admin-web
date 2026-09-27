import { IUserStore } from "@entities/user";
import { notifyApiError } from "@shared/lib/http";
import { INotificationService } from "@shared/lib/notifications";
import { useZodForm } from "@shared/ui";

import { changePasswordSchema, TChangePasswordForm } from "./validation";

const EMPTY: TChangePasswordForm = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};

export const useChangePasswordVM = () => {
  const userStore = IUserStore.useInstance();
  const toast = INotificationService.useInstance();
  const form = useZodForm(changePasswordSchema, { defaultValues: EMPTY });

  const submit = async (data: TChangePasswordForm) => {
    const res = await userStore.changePassword(
      data.currentPassword,
      data.newPassword,
    );

    if (res.error) {
      notifyApiError(toast, res.error);

      return;
    }

    form.reset(EMPTY);
    toast.success("Пароль изменён. Остальные сессии завершены.");
  };

  return { form, submit };
};
