import { cn } from "@shared/lib/utils";
import { Link } from "@tanstack/react-router";
import { FC } from "react";

import { NAV_ICON_SIZE, NavItem } from "../model/constants";

interface HeaderNavItemProps {
  item: NavItem;
  /** Vertical full-width variant for the mobile menu. */
  list?: boolean;
  onClick?: () => void;
}

export const HeaderNavItem: FC<HeaderNavItemProps> = ({
  item,
  list,
  onClick,
}) => (
  <Link
    to={item.to}
    activeOptions={{ exact: item.to === "/" }}
    onClick={onClick}
    className={cn(
      "group/navitem relative flex items-center gap-2 rounded-lg text-sm font-medium transition-colors",
      "text-muted-foreground hover:bg-accent hover:text-foreground",
      "data-[status=active]:bg-brand/10 data-[status=active]:text-brand data-[status=active]:hover:bg-brand/10",
      list ? "w-full px-3 py-2" : "px-3 py-1.5",
    )}
  >
    {list && (
      <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-brand opacity-0 transition-opacity group-data-[status=active]/navitem:opacity-100" />
    )}
    <item.icon size={NAV_ICON_SIZE} className="flex-shrink-0" />
    <span className={cn(list && "flex-1", "truncate")}>{item.label}</span>
  </Link>
);
