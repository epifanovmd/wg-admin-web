import { cn } from "@shared/lib/utils";
import * as React from "react";

import type { AvatarProps } from "./Avatar";
import { avatarVariants } from "./avatar-variants";

export interface AvatarGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Сколько аватаров показать; остальные сворачиваются в счётчик `+N`. */
  max?: number;
  size?: AvatarProps["size"];
}

const isAvatarElement = (
  node: React.ReactNode,
): node is React.ReactElement<AvatarProps> => React.isValidElement(node);

const AvatarGroup = React.forwardRef<HTMLDivElement, AvatarGroupProps>(
  ({ className, max, size, children, ...props }, ref) => {
    const items = React.Children.toArray(children).filter(isAvatarElement);

    const visible = typeof max === "number" ? items.slice(0, max) : items;
    const overflow =
      typeof max === "number" ? Math.max(0, items.length - max) : 0;

    return (
      <div
        ref={ref}
        className={cn("flex items-center -space-x-2", className)}
        {...props}
      >
        {visible.map(child =>
          React.cloneElement(child, {
            size: child.props.size ?? size,
            className: cn("ring-2 ring-background", child.props.className),
          }),
        )}
        {overflow > 0 && (
          <span
            role="img"
            aria-label={`ещё ${overflow}`}
            className={cn(
              avatarVariants({ size: size ?? "md", shape: "circle" }),
              "ring-2 ring-background",
            )}
          >
            +{overflow}
          </span>
        )}
      </div>
    );
  },
);

AvatarGroup.displayName = "AvatarGroup";

export { AvatarGroup };
