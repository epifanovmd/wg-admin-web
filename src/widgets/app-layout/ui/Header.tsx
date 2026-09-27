import { IconButton, Tooltip } from "@shared/ui";
import { Menu } from "lucide-react";
import { observer } from "mobx-react-lite";
import { FC } from "react";

import { useHeaderVM } from "../model/useHeaderVM";
import { AppLogo } from "./AppLogo";
import { HeaderNavGroup } from "./HeaderNavGroup";
import { HeaderNavItem } from "./HeaderNavItem";
import { MobileMenu } from "./MobileMenu";
import { ProfileMenu } from "./ProfileMenu";

export const Header: FC = observer(() => {
  const {
    displayName,
    initials,
    subtitle,
    visibleGroups,
    mobileOpen,
    setMobileOpen,
  } = useHeaderVM();

  return (
    <header className="sticky top-0 z-30 flex-shrink-0 border-b border-border bg-card/80 backdrop-blur">
      <div className="mx-auto flex h-14 w-full max-w-7xl items-center gap-2 px-3 sm:gap-4 sm:px-4">
        <Tooltip content="Открыть меню">
          <IconButton
            variant="ghost"
            size="sm"
            className="lg:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label="Открыть меню"
          >
            <Menu size={18} />
          </IconButton>
        </Tooltip>

        <AppLogo compact className="shrink-0 whitespace-nowrap" />

        <nav className="ml-2 hidden items-center gap-1 lg:flex">
          {visibleGroups
            .filter(group => !group.mobileOnly)
            .map(group =>
              group.label && group.items.length > 1 ? (
                <HeaderNavGroup key={group.label} group={group} />
              ) : (
                group.items.map(item => (
                  <HeaderNavItem key={item.to as string} item={item} />
                ))
              ),
            )}
        </nav>

        <div className="ml-auto flex items-center gap-1 sm:gap-2">
          <ProfileMenu
            displayName={displayName}
            initials={initials}
            subtitle={subtitle}
          />
        </div>
      </div>

      <MobileMenu
        open={mobileOpen}
        onOpenChange={setMobileOpen}
        visibleGroups={visibleGroups}
        displayName={displayName}
        initials={initials}
        subtitle={subtitle}
      />
    </header>
  );
});
