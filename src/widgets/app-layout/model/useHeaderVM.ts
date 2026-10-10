import { useAgentRelease } from "@entities/agent";
import { IUserStore } from "@entities/user";
import { WG_PERMISSIONS } from "@entities/wg";
import { IMainApi } from "@shared/api";
import type { IAppVersionDto } from "@shared/api/gen/main/model";
import { WEB_BUILD } from "@shared/config/env";
import { ownPermission } from "@shared/lib/access";
import { useEntity } from "@shared/lib/holders";
import { useState } from "react";

import { NAV_GROUPS } from "./constants";
import { formatVersionLines } from "./versions";

/**
 * Шапка: профиль, версии и разделы по правам. Сборки агента отслеживаются всю
 * сессию: у нод — значок с числом доступных обновлений агентов и воркеров.
 */
export const useHeaderVM = () => {
  const api = IMainApi.useInstance();
  const userStore = IUserStore.useInstance();
  const { user, model } = userStore;
  const [mobileOpen, setMobileOpen] = useState(false);

  const appVersion = useEntity<IAppVersionDto>({
    queryFn: () => api.getAppVersion(),
    autoLoad: true,
  });
  const versions = formatVersionLines(WEB_BUILD, appVersion.data);
  const canAgent =
    userStore.can(ownPermission(WG_PERMISSIONS.NODE_VIEW)) &&
    userStore.scope(WG_PERMISSIONS.NODE_AGENT) !== null;
  const release = useAgentRelease(canAgent).data;
  const updates = release
    ? release.candidates.length + release.workerCandidates.length
    : 0;

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
        item.to === "/wg/nodes" && updates > 0
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
