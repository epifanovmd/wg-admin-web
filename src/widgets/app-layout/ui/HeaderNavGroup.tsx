import { cn } from "@shared/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@shared/ui";
import { Link, useLocation } from "@tanstack/react-router";
import { ChevronDown } from "lucide-react";
import { FC } from "react";

import { NAV_ICON_SIZE, NavGroup } from "../model/constants";

interface HeaderNavGroupProps {
  group: NavGroup;
}

/** Именованная группа навигации в шапке — выпадающее меню. */
export const HeaderNavGroup: FC<HeaderNavGroupProps> = ({ group }) => {
  const pathname = useLocation({ select: location => location.pathname });
  const active = group.items.some(item => pathname.startsWith(String(item.to)));

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={cn(
            "flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
            "text-muted-foreground hover:bg-accent hover:text-foreground data-[state=open]:bg-accent",
            active && "bg-brand/10 text-brand hover:bg-brand/10",
          )}
        >
          {group.label}
          <ChevronDown size={14} aria-hidden />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-52">
        {group.items.map(item => (
          <DropdownMenuItem key={String(item.to)} asChild>
            <Link to={item.to}>
              <item.icon
                size={NAV_ICON_SIZE}
                aria-hidden
                className="text-muted-foreground"
              />
              {item.label}
            </Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
