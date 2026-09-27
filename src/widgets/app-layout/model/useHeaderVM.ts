import { IUserStore } from "@entities/user";
import { useState } from "react";

import { NAV_GROUPS } from "./constants";

export const useHeaderVM = () => {
  const userStore = IUserStore.useInstance();
  const { user, model } = userStore;
  const [mobileOpen, setMobileOpen] = useState(false);

  const displayName = model?.displayName ?? "Admin";
  const initials = model?.initials ?? "A";

  const subtitle =
    user?.email ??
    user?.phone ??
    (user?.username ? `@${user.username}` : undefined);

  const visibleGroups = NAV_GROUPS.map(group => ({
    ...group,
    items: group.items.filter(
      item => !item.permission || userStore.can(item.permission),
    ),
  })).filter(group => group.items.length > 0);

  return {
    displayName,
    initials,
    subtitle,
    visibleGroups,
    mobileOpen,
    setMobileOpen,
  };
};
