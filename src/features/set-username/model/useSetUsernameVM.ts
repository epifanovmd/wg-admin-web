import { IUserStore } from "@entities/user";
import { notifyApiError } from "@shared/lib/http";
import { INotificationService } from "@shared/lib/notifications";
import { useZodForm } from "@shared/ui";
import { useEffect } from "react";

import { TUsernameForm, usernameSchema } from "./validation";

export const useSetUsernameVM = () => {
  const userStore = IUserStore.useInstance();
  const toast = INotificationService.useInstance();
  const current = userStore.user?.username ?? "";
  const form = useZodForm(usernameSchema, {
    defaultValues: { username: current },
  });

  useEffect(() => {
    form.reset({ username: current });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current]);

  const submit = async ({ username }: TUsernameForm) => {
    const res = await userStore.setUsername(username);

    if (res.error) {
      notifyApiError(toast, res.error);

      return;
    }

    toast.success("Имя пользователя сохранено");
  };

  return { form, submit, current };
};
