import { IMainApi } from "@shared/api";
import type {
  IWgNodeInstallCommandDto,
  TWgNodeInstallMode,
} from "@shared/api/gen/main/model";
import { notifyApiError } from "@shared/lib/http";
import { INotificationService } from "@shared/lib/notifications";
import { useState } from "react";

/**
 * Команда установки агента с новым одноразовым токеном: для установки вручную
 * или переустановки — службой или в Docker (контейнер в сети узла). Агент,
 * который уже работает, остаётся на связи до регистрации нового.
 */
export const useWgNodeInstallCommandVM = (nodeId: string) => {
  const api = IMainApi.useInstance();
  const toast = INotificationService.useInstance();
  const [install, setInstall] = useState<IWgNodeInstallCommandDto | null>(null);
  const [mode, setMode] = useState<TWgNodeInstallMode>("systemd");
  const [loading, setLoading] = useState(false);

  const issue = async (next: TWgNodeInstallMode = "systemd") => {
    setLoading(true);

    const res = await api.createWgNodeInstallCommand(nodeId, {
      ...(next !== "systemd" && { mode: next }),
    });

    setLoading(false);
    if (res.error) {
      notifyApiError(toast, res.error);

      return;
    }

    setMode(next);
    setInstall(res.data);
  };

  return {
    install,
    mode,
    loading,
    issue,
    close: () => setInstall(null),
  };
};

export type WgNodeInstallCommandVM = ReturnType<
  typeof useWgNodeInstallCommandVM
>;
