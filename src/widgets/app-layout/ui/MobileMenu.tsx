import { SignOutButton } from "@features/sign-out";
import { ThemeToggle } from "@features/toggle-theme";
import {
  Drawer,
  DrawerContent,
  DrawerTitle,
  IconButton,
  Tooltip,
} from "@shared/ui";
import { Link } from "@tanstack/react-router";
import { User, X } from "lucide-react";

import { NavGroup } from "../model/constants";
import { AppLogo } from "./AppLogo";
import { HeaderNavItem } from "./HeaderNavItem";

interface MobileMenuProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  visibleGroups: NavGroup[];
  displayName: string;
  initials: string;
  subtitle?: string;
}

export const MobileMenu = ({
  open,
  onOpenChange,
  visibleGroups,
  displayName,
  initials,
  subtitle,
}: MobileMenuProps) => {
  const close = () => onOpenChange(false);

  return (
    <Drawer open={open} onOpenChange={onOpenChange} direction="left">
      <DrawerContent className="w-72 bg-card shadow-xl">
        <DrawerTitle className="sr-only">Навигация</DrawerTitle>

        <div className="flex h-14 items-center justify-between border-b border-border px-4">
          <AppLogo size="sm" />
          <Tooltip content="Закрыть меню">
            <IconButton
              variant="ghost"
              size="xs"
              onClick={close}
              aria-label="Закрыть меню"
            >
              <X size={16} aria-hidden />
            </IconButton>
          </Tooltip>
        </div>

        <nav className="flex flex-1 flex-col gap-5 overflow-y-auto px-3 py-4">
          {visibleGroups.map((group, gi) => (
            <div key={group.label ?? gi} className="flex flex-col gap-1">
              {group.label && (
                <p className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/70">
                  {group.label}
                </p>
              )}
              {group.items.map(item => (
                <HeaderNavItem
                  key={item.to as string}
                  item={item}
                  list
                  onClick={close}
                />
              ))}
            </div>
          ))}
        </nav>

        <div className="flex flex-col gap-1 border-t border-border p-2">
          <Link
            to="/profile"
            onClick={close}
            className="flex items-center gap-2.5 rounded-lg p-2 transition-colors hover:bg-accent data-[status=active]:bg-accent"
          >
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand to-brand/70 text-xs font-semibold text-brand-foreground ring-1 ring-inset ring-white/15">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-foreground">
                {displayName}
              </p>
              {subtitle && (
                <p className="truncate text-[11px] text-muted-foreground">
                  {subtitle}
                </p>
              )}
            </div>
            <User
              size={15}
              aria-hidden
              className="flex-shrink-0 text-muted-foreground"
            />
          </Link>

          <div className="flex items-center justify-between rounded-lg px-2 py-1">
            <span className="text-xs text-muted-foreground">
              Тема оформления
            </span>
            <ThemeToggle variant="ghost" size="sm" className="h-7 w-7 p-0" />
          </div>

          <SignOutButton
            onBeforeSignOut={close}
            className="flex items-center gap-2.5 rounded-lg px-2 py-2 text-sm font-medium text-foreground/80 transition-colors hover:bg-destructive/10 hover:text-destructive"
          />
        </div>
      </DrawerContent>
    </Drawer>
  );
};
