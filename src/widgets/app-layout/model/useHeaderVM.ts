import { IUserStore } from "@entities/user";
import { IMainApi } from "@shared/api";
import type { IAppVersionDto } from "@shared/api/gen/main/model";
import { WEB_BUILD } from "@shared/config/env";
import { useEntity } from "@shared/lib/holders";
import { useState } from "react";

import { NAV_GROUPS } from "./constants";
import { formatVersionLines } from "./versions";

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

  const displayName = model?.displayName ?? "Admin";
  const initials = model?.initials ?? "A";

  const subtitle =
    user?.email ??
    user?.phone ??
    (user?.username ? `@${user.username}` : undefined);

  const visibleGroups = NAV_GROUPS.map(group => ({
    ...group,
    items: group.items.filter(
      item =>
        !item.permission ||
        [item.permission].flat().some(permission => userStore.can(permission)),
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
