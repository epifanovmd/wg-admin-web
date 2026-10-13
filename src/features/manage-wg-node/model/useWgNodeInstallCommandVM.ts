import { IMainApi } from "@shared/api";
import type { IWgNodeInstallCommandDto } from "@shared/api/gen/main/model";
import { notifyApiError } from "@shared/lib/http";
import { INotificationService } from "@shared/lib/notifications";
import { useState } from "react";

/**
 * Команда установки агента с новым одноразовым токеном: для установки вручную
 * или переустановки. Агент, который уже работает, остаётся на связи до
 * регистрации нового.
 */
export const useWgNodeInstallCommandVM = (nodeId: string) => {
  const api = IMainApi.useInstance();
  const toast = INotificationService.useInstance();
  const [install, setInstall] = useState<IWgNodeInstallCommandDto | null>(null);
  const [loading, setLoading] = useState(false);

  const issue = async () => {
    setLoading(true);

    const res = await api.createWgNodeInstallCommand(nodeId, {});

    setLoading(false);
    if (res.error) {
      notifyApiError(toast, res.error);

      return;
    }

    setInstall(res.data);
  };

  return { install, loading, issue, close: () => setInstall(null) };
};

export type WgNodeInstallCommandVM = ReturnType<
  typeof useWgNodeInstallCommandVM
>;
