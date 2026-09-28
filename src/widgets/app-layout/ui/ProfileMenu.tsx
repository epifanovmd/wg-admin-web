import { SignOutButton } from "@features/sign-out";
import { ThemeMenuItem } from "@features/toggle-theme";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@shared/ui";
import { Link } from "@tanstack/react-router";
import { ChevronDown, User } from "lucide-react";
import { FC } from "react";

import { ACCOUNT_NAV_ITEMS } from "../model/constants";
import type { IVersionLine } from "../model/versions";
import { AppVersions } from "./AppVersions";
import { ProfileAvatar } from "./ProfileAvatar";

interface ProfileMenuProps {
  displayName: string;
  initials: string;
  subtitle?: string;
  /** Версии веба, API и агента — внизу меню. */
  versions: IVersionLine[];
}

const SIGN_OUT_CLASS =
  "font-medium data-[highlighted]:bg-destructive/10 data-[highlighted]:text-destructive";

export const ProfileMenu: FC<ProfileMenuProps> = ({
  displayName,
  initials,
  subtitle,
  versions,
}) => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <button
        type="button"
        className="flex items-center gap-2 rounded-lg p-1 pr-2 transition-colors hover:bg-accent data-[state=open]:bg-accent"
      >
        <ProfileAvatar initials={initials} />
        <span className="hidden max-w-[140px] truncate text-sm font-medium text-foreground sm:block">
          {displayName}
        </span>
        <ChevronDown
          size={15}
          aria-hidden
          className="hidden flex-shrink-0 text-muted-foreground sm:block"
        />
      </button>
    </DropdownMenuTrigger>

    <DropdownMenuContent align="end" className="w-52">
      <DropdownMenuLabel className="flex items-center gap-3 p-2 font-normal">
        <ProfileAvatar initials={initials} size="md" />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-foreground">
            {displayName}
          </p>
          {subtitle && (
            <p className="truncate text-xs text-muted-foreground">{subtitle}</p>
          )}
        </div>
      </DropdownMenuLabel>

      <DropdownMenuSeparator />

      <DropdownMenuItem asChild>
        <Link to="/profile">
          <User aria-hidden className="text-muted-foreground" />
          Профиль
        </Link>
      </DropdownMenuItem>

      {ACCOUNT_NAV_ITEMS.map(item => (
        <DropdownMenuItem key={String(item.to)} asChild>
          <Link to={item.to}>
            <item.icon aria-hidden className="text-muted-foreground" />
            {item.label}
          </Link>
        </DropdownMenuItem>
      ))}

      <ThemeMenuItem />

      <DropdownMenuSeparator />

      <DropdownMenuItem asChild className={SIGN_OUT_CLASS}>
        <SignOutButton />
      </DropdownMenuItem>

      <DropdownMenuSeparator />

      <AppVersions lines={versions} />
    </DropdownMenuContent>
  </DropdownMenu>
);
