import { IUserStore } from "@entities/user";
import { INotificationService } from "@shared/lib/notifications";
import { useCallback, useState } from "react";

export const useRequestEmailVerification = () => {
  const userStore = IUserStore.useInstance();
  const toast = INotificationService.useInstance();
  const [isLoading, setLoading] = useState(false);

  const requestVerification = useCallback(async () => {
    setLoading(true);

    try {
      const response = await userStore.requestVerifyEmail();

      if (response.error) {
        toast.error(response.error.message);
      } else {
        toast.success("Письмо с подтверждением отправлено");
      }
    } finally {
      setLoading(false);
    }
  }, [userStore, toast]);

  return { isLoading, requestVerification };
};
