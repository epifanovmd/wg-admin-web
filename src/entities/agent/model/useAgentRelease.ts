import { IMainApi } from "@shared/api";
import type { IAgentReleaseDto } from "@shared/api/gen/main/model";
import { useEntity } from "@shared/lib/holders";
import { INotificationService } from "@shared/lib/notifications";
import { useSocketEvent } from "@shared/lib/socket";

import { agentReleaseMessage, type IAgentReleaseNotice } from "../lib/release";

/**
 * Выпуск агента и кого можно обновить. Бэкенд сам следит за новыми версиями
 * агента: на `agent:release` выпуск перечитывается (обновление видно без
 * перезагрузки страницы), о новой версии — уведомление (одно на версию).
 */
export const useAgentRelease = (enabled: boolean) => {
  const api = IMainApi.useInstance();
  const toast = INotificationService.useInstance();
  const release = useEntity<IAgentReleaseDto>({
    queryFn: () => api.getAgentRelease(),
    autoLoad: true,
    enabled,
  });

  useSocketEvent<[IAgentReleaseNotice]>(
    "agent:release",
    notice => {
      void release.refresh();

      const message = agentReleaseMessage(notice);

      if (message)
        toast.info(message, { id: `agent-release-${notice.version}` });
    },
    enabled,
  );

  return release;
};
