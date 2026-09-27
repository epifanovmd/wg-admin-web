import { cva } from "class-variance-authority";

export type AvatarSize = "xs" | "sm" | "md" | "lg" | "xl";

export type AvatarStatus = "online" | "away" | "busy" | "offline";

/** Габариты аватара по размеру: общие для Avatar и SkeletonAvatar. */
export const AVATAR_SIZE_CLASS: Record<AvatarSize, string> = {
  xs: "h-5 w-5",
  sm: "h-8 w-8",
  md: "h-10 w-10",
  lg: "h-12 w-12",
  xl: "h-16 w-16",
};

export const avatarVariants = cva(
  "relative inline-flex shrink-0 items-center justify-center bg-muted text-muted-foreground font-medium uppercase select-none",
  {
    variants: {
      size: {
        xs: `${AVATAR_SIZE_CLASS.xs} text-[10px]`,
        sm: `${AVATAR_SIZE_CLASS.sm} text-xs`,
        md: `${AVATAR_SIZE_CLASS.md} text-sm`,
        lg: `${AVATAR_SIZE_CLASS.lg} text-base`,
        xl: `${AVATAR_SIZE_CLASS.xl} text-lg`,
      },
      shape: {
        circle: "rounded-full",
        square: "rounded-lg",
      },
    },
    defaultVariants: {
      size: "md",
      shape: "circle",
    },
  },
);

/** Точка статуса: размер пропорционален аватару, кольцо отделяет от фона. */
export const avatarStatusVariants = cva(
  "absolute right-0 bottom-0 block rounded-full ring-2 ring-background",
  {
    variants: {
      size: {
        xs: "size-1.5",
        sm: "size-2",
        md: "size-2.5",
        lg: "size-3",
        xl: "size-3.5",
      },
      status: {
        online: "bg-success",
        away: "bg-warning",
        busy: "bg-destructive",
        offline: "bg-muted-foreground",
      },
    },
    defaultVariants: {
      size: "md",
      status: "offline",
    },
  },
);

/** Текст статуса для скринридера и подсказки. */
export const AVATAR_STATUS_LABEL: Record<AvatarStatus, string> = {
  online: "В сети",
  away: "Отошёл",
  busy: "Занят",
  offline: "Не в сети",
};
