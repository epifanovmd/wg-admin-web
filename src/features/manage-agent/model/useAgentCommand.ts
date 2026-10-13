import { IAgentsStore, waitAgentCommand } from "@entities/agent";
import { IMainApi } from "@shared/api";
import type { AgentCommandDto } from "@shared/api/gen/main/model";
import { notifyApiError } from "@shared/lib/http";
import { INotificationService } from "@shared/lib/notifications";
import { useState } from "react";

/**
 * Команда агенту от пользователя: поставить, отметить как ждущую (строки
 * агента и воркера показывают ожидание) и дождаться итога. Ошибка постановки —
 * тост, `null`.
 */
export const useAgentCommand = () => {
  const api = IMainApi.useInstance();
  const store = IAgentsStore.useInstance();
  const toast = INotificationService.useInstance();
  const [busy, setBusy] = useState<string[]>([]);

  const run = async (
    key: string,
    request: () => Promise<{ data?: AgentCommandDto | null; error?: unknown }>,
    onQueued?: (command: AgentCommandDto) => void,
  ): Promise<AgentCommandDto | null> => {
    setBusy(prev => [...prev, key]);
    try {
      const res = await request();

      if (!res.data) {
        notifyApiError(toast, res.error);

        return null;
      }
      store.trackCommand(res.data);
      onQueued?.(res.data);
      const done = await waitAgentCommand(api, res.data);

      store.settleCommand(done.id);
      void store.fetch(done.agentId);

      return done;
    } finally {
      setBusy(prev => prev.filter(item => item !== key));
    }
  };

  return { run, isBusy: (key: string) => busy.includes(key) };
};
