import { IUserStore } from "@entities/user";
import { useLeaveConfirmation } from "@shared/lib/navigation";
import { INotificationService } from "@shared/lib/notifications";
import { useZodForm } from "@shared/ui";
import { parseISO } from "date-fns";
import { useEffect } from "react";

import { profileFormValidationSchema, TProfileForm } from "./validation";

interface UseEditProfileVMOptions {
  open: boolean;
  onSuccess: () => void;
}

export const useEditProfileVM = ({
  open,
  onSuccess,
}: UseEditProfileVMOptions) => {
  const userStore = IUserStore.useInstance();
  const toast = INotificationService.useInstance();

  const form = useZodForm(profileFormValidationSchema, {
    defaultValues: {},
  });

  const { isDirty } = form.formState;

  useLeaveConfirmation({
    when: open && isDirty,
    dialog: { description: "Изменения профиля не сохранены и пропадут." },
  });

  useEffect(() => {
    if (!open) return;

    const profile = userStore.user?.profile;

    form.reset({
      firstName: profile?.firstName ?? "",
      lastName: profile?.lastName ?? "",
      gender: profile?.gender ?? "",
      birthDate: profile?.birthDate ? parseISO(profile.birthDate) : undefined,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const submit = async (data: TProfileForm) => {
    const res = await userStore.updateProfile({
      firstName: data.firstName || undefined,
      lastName: data.lastName || undefined,
      gender: data.gender || undefined,
      birthDate: data.birthDate?.toISOString(),
    });

    if (res.error) {
      toast.error(res.error.message);

      return;
    }

    toast.success("Профиль обновлён");
    onSuccess();
  };

  return { form, submit };
};
