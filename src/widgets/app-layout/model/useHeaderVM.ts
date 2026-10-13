import {
  AGENT_PERMISSIONS,
  IAgentsStore,
  useAgentReleaseWatch,
} from "@entities/agent";
import { IUserStore } from "@entities/user";
import { IMainApi } from "@shared/api";
import type { IAppVersionDto } from "@shared/api/gen/main/model";
import { WEB_BUILD } from "@shared/config/env";
import { useEntity } from "@shared/lib/holders";
import { INotificationService } from "@shared/lib/notifications";
import { useState } from "react";

import { NAV_GROUPS } from "./constants";
import { formatVersionLines } from "./versions";

/**
 * Шапка: профиль, версии и разделы по правам. Новые версии агентов и воркеров
 * отслеживаются всю сессию: у раздела агентов — значок с числом доступных
 * обновлений, новая версия — уведомление.
 */
export const useHeaderVM = () => {
  const api = IMainApi.useInstance();
  const userStore = IUserStore.useInstance();
  const agents = IAgentsStore.useInstance();
  const toast = INotificationService.useInstance();
  const { user, model } = userStore;
  const [mobileOpen, setMobileOpen] = useState(false);

  const appVersion = useEntity<IAppVersionDto>({
    queryFn: () => api.getAppVersion(),
    autoLoad: true,
  });
  const versions = formatVersionLines(WEB_BUILD, appVersion.data);
  const canAgents = userStore.can(AGENT_PERMISSIONS.VIEW);

  useAgentReleaseWatch(canAgents, {
    onUpdateAvailable: candidate => {
      const name = agents.byId(candidate.agentId)?.name ?? candidate.agentId;

      toast.info(
        candidate.worker
          ? `Воркер «${candidate.worker}» агента «${name}»: есть версия ${candidate.target}.`
          : `Агент «${name}» нашёл версию ${candidate.target} (сейчас ${candidate.current ?? "?"}).`,
        { title: "Новая версия" },
      );
    },
  });

  const updates = canAgents ? agents.candidates.length : 0;

  const displayName = model?.displayName ?? "Admin";
  const initials = model?.initials ?? "A";

  const subtitle =
    user?.email ??
    user?.phone ??
    (user?.username ? `@${user.username}` : undefined);

  const visibleGroups = NAV_GROUPS.map(group => ({
    ...group,
    items: group.items
      .filter(
        item =>
          !item.permission ||
          [item.permission]
            .flat()
            .some(permission => userStore.can(permission)),
      )
      .map(item =>
        item.to === "/agents" && updates > 0
          ? { ...item, badge: updates }
          : item,
      ),
  })).filter(group => group.items.length > 0);

  return {
    displayName,
    initials,
    subtitle,
    visibleGroups,
    versions,
    mobileOpen,
    setMobileOpen,
  };
};
