import { IAuthStore } from "@entities/auth";
import { IUserStore } from "@entities/user";
import { notifyApiError } from "@shared/lib/http";
import { INotificationService } from "@shared/lib/notifications";
import { useZodForm } from "@shared/ui";
import { useState } from "react";
import { z } from "zod";

export const deleteAccountSchema = z.object({
  password: z.string().min(1, "Введите пароль."),
});

export type TDeleteAccountForm = z.infer<typeof deleteAccountSchema>;

export const useDeleteAccountVM = () => {
  const userStore = IUserStore.useInstance();
  const authStore = IAuthStore.useInstance();
  const toast = INotificationService.useInstance();
  const [open, setOpen] = useState(false);
  const form = useZodForm(deleteAccountSchema, {
    defaultValues: { password: "" },
  });

  const openDialog = () => {
    form.reset({ password: "" });
    setOpen(true);
  };

  const submit = async ({ password }: TDeleteAccountForm) => {
    const res = await userStore.deleteMyAccount(password);

    if (res.error) {
      notifyApiError(toast, res.error);

      return;
    }

    setOpen(false);
    toast.success("Аккаунт удалён");
    authStore.signOut();
  };

  return { open, setOpen, openDialog, form, submit };
};
