import { cn } from "@shared/lib/utils";
import * as React from "react";

import {
  AVATAR_STATUS_LABEL,
  type AvatarSize,
  type AvatarStatus,
  avatarStatusVariants,
} from "./avatar-variants";

export interface AvatarStatusDotProps extends React.HTMLAttributes<HTMLSpanElement> {
  status: AvatarStatus;
  size?: AvatarSize | null;
  /** Скрыть от скринридера: статус уже входит в имя аватара. */
  decorative?: boolean;
}

/** Цветная точка статуса в правом нижнем углу аватара. */
const AvatarStatusDot = React.forwardRef<HTMLSpanElement, AvatarStatusDotProps>(
  ({ status, size, decorative = false, className, ...props }, ref) => {
    const label = AVATAR_STATUS_LABEL[status];

    return (
      <span
        ref={ref}
        role={decorative ? undefined : "img"}
        aria-label={decorative ? undefined : label}
        aria-hidden={decorative || undefined}
        title={label}
        data-status={status}
        className={cn(avatarStatusVariants({ size, status }), className)}
        {...props}
      />
    );
  },
);

AvatarStatusDot.displayName = "AvatarStatusDot";

export { AvatarStatusDot };
