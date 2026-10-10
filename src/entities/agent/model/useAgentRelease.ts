import { IMainApi } from "@shared/api";
import type {
  IAgentReleaseDto,
  IAgentUpdateCandidateDto,
} from "@shared/api/gen/main/model";
import { useEntity } from "@shared/lib/holders";
import { INotificationService } from "@shared/lib/notifications";
import { useSocketEvent } from "@shared/lib/socket";
import { reaction } from "mobx";
import { useEffect } from "react";

import {
  agentFoundMessage,
  agentReleaseMessage,
  type IAgentReleaseNotice,
} from "../lib/release";

const agentFound = (candidates: IAgentUpdateCandidateDto[]) =>
  candidates.filter(c => c.source === "agent");

/**
 * Сборки агента и кого можно обновить. Бэкенд сам следит за новыми версиями
 * агента: на `agent:release` сборки перечитываются (обновление видно без
 * перезагрузки страницы), о новой версии — уведомление (одно на версию). Версия,
 * которую агент нашёл сам, появляется с очередным чтением сборок — тоже с
 * уведомлением; уже известные при первом чтении — без него.
 */
export const useAgentRelease = (enabled: boolean) => {
  const api = IMainApi.useInstance();
  const toast = INotificationService.useInstance();
  const release = useEntity<IAgentReleaseDto>({
    queryFn: () => api.getAgentRelease(),
    autoLoad: true,
    enabled,
  });

  useEffect(() => {
    if (!enabled) return undefined;
    let known: Set<string> | null = null;

    return reaction(
      () => release.data?.candidates,
      candidates => {
        if (!candidates) return;
        const found = agentFound(candidates);

        for (const candidate of found) {
          const key = `${candidate.agentId}@${candidate.target}`;

          if (known && !known.has(key)) {
            toast.info(agentFoundMessage(candidate), {
              id: `agent-found-${key}`,
            });
          }
        }
        known = new Set(found.map(c => `${c.agentId}@${c.target}`));
      },
      { fireImmediately: true },
    );
  }, [enabled, release, toast]);

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
