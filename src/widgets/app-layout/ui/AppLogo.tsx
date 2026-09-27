import { APP_NAME } from "@shared/config/env";
import { cn } from "@shared/lib/utils";
import { Link } from "@tanstack/react-router";
import { ShieldCheck } from "lucide-react";
import * as React from "react";

type AppLogoSize = "sm" | "md";

export interface AppLogoProps extends React.ComponentProps<typeof Link> {
  size?: AppLogoSize;
  /** Только значок и имя: для узкой шапки, где подпись ни к чему */
  compact?: boolean;
}

const SIZE_CLASSES: Record<
  AppLogoSize,
  { badge: string; icon: number; name: string; caption: string }
> = {
  sm: { badge: "h-8 w-8", icon: 16, name: "text-sm", caption: "text-[11px]" },
  md: { badge: "h-11 w-11", icon: 24, name: "text-lg", caption: "text-xs" },
};

/** Логотип приложения со ссылкой на главную. */
export const AppLogo = ({
  size = "sm",
  compact = false,
  className,
  ...rest
}: AppLogoProps) => {
  const classes = SIZE_CLASSES[size];

  return (
    <Link
      to="/"
      className={cn(
        "group flex items-center rounded-lg transition-colors",
        compact ? "gap-2 px-1 py-1 hover:bg-accent" : "gap-2.5",
        className,
      )}
      {...rest}
    >
      <div
        className={cn(
          "relative flex flex-shrink-0 items-center justify-center rounded-xl",
          "bg-gradient-to-br from-brand to-brand/70 text-brand-foreground",
          "shadow-sm shadow-brand/30 ring-1 ring-inset ring-white/15",
          "hover-zoom",
          classes.badge,
        )}
      >
        <ShieldCheck aria-hidden size={classes.icon} strokeWidth={2.2} />
      </div>
      <div className={cn("leading-tight", compact && "hidden xl:block")}>
        <p
          className={cn(
            "font-semibold tracking-tight text-foreground",
            classes.name,
          )}
        >
          {APP_NAME}
        </p>
        {!compact && (
          <p className={cn("text-muted-foreground", classes.caption)}>
            WireGuard VPN
          </p>
        )}
      </div>
    </Link>
  );
};
