import { FC } from "react";

interface ProfileAvatarProps {
  initials: string;
  size?: "sm" | "md";
}

export const ProfileAvatar: FC<ProfileAvatarProps> = ({
  initials,
  size = "sm",
}) => (
  <div
    className={[
      "flex flex-shrink-0 items-center justify-center rounded-full",
      "bg-gradient-to-br from-brand to-brand/70 font-semibold text-brand-foreground",
      "ring-1 ring-inset ring-white/15",
      size === "sm" ? "h-8 w-8 text-xs" : "h-10 w-10 text-sm",
    ].join(" ")}
  >
    {initials}
  </div>
);
