import { IUserStore } from "@entities/user";
import { notifyApiError } from "@shared/lib/http";
import { INotificationService } from "@shared/lib/notifications";
import { useZodForm } from "@shared/ui";
import { useState } from "react";

import {
  emailCodeSchema,
  newEmailSchema,
  TEmailCodeForm,
  TNewEmailForm,
} from "./validation";

/** Смена email в два шага: новый адрес → код, пришедший на него. */
export const useChangeEmailVM = () => {
  const userStore = IUserStore.useInstance();
  const toast = INotificationService.useInstance();
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);

  const emailForm = useZodForm(newEmailSchema, {
    defaultValues: { email: "" },
  });
  const codeForm = useZodForm(emailCodeSchema, {
    defaultValues: { code: "" },
  });

  const requestChange = async ({ email }: TNewEmailForm) => {
    const res = await userStore.changeEmail(email);

    if (res.error) {
      notifyApiError(toast, res.error);

      return;
    }

    setPendingEmail(email);
    codeForm.reset({ code: "" });
    toast.info(`Код подтверждения отправлен на ${email}`);
  };

  const confirm = async ({ code }: TEmailCodeForm) => {
    const res = await userStore.confirmEmailChange(code);

    if (res.error) {
      notifyApiError(toast, res.error);

      return;
    }

    setPendingEmail(null);
    emailForm.reset({ email: "" });
    toast.success("Email изменён");
  };

  const cancel = () => setPendingEmail(null);

  return {
    currentEmail: userStore.user?.email ?? null,
    pendingEmail,
    emailForm,
    codeForm,
    requestChange,
    confirm,
    cancel,
  };
};
