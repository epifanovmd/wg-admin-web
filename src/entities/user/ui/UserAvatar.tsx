import { Avatar } from "@shared/ui";
import { FC } from "react";

const COLORS = [
  "bg-violet-500",
  "bg-blue-500",
  "bg-green-500",
  "bg-amber-500",
  "bg-rose-500",
  "bg-cyan-500",
  "bg-fuchsia-500",
  "bg-orange-500",
];

const colorFromString = (s: string): string => {
  let h = 0;

  for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0;

  return COLORS[Math.abs(h) % COLORS.length];
};

const SIZE_CLASS: Record<NonNullable<UserAvatarProps["size"]>, string> = {
  sm: "w-7 h-7 text-xs",
  md: "w-8 h-8 text-sm",
  lg: "w-10 h-10 text-base",
  xl: "w-20 h-20 text-2xl ring-4 ring-card shadow-md",
};

type UserAvatarProps = {
  name: string;
  size?: "sm" | "md" | "lg" | "xl";
};

export const UserAvatar: FC<UserAvatarProps> = ({ name, size = "md" }) => (
  <Avatar
    name={name}
    fallback={name.trim() ? undefined : "?"}
    className={`${colorFromString(name)} font-semibold text-white ${SIZE_CLASS[size]}`}
  />
);
