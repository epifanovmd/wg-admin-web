import { cn } from "@shared/lib/utils";
import type { VariantProps } from "class-variance-authority";
import * as React from "react";

import {
  AVATAR_STATUS_LABEL,
  type AvatarStatus,
  avatarVariants,
} from "./avatar-variants";
import { AvatarStatusDot } from "./AvatarStatusDot";

export interface AvatarProps
  extends
    React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof avatarVariants> {
  src?: string;
  alt?: string;
  /** Имя: даёт инициалы для fallback и доступное имя. */
  name?: string;
  fallback?: React.ReactNode;
  /** Статус присутствия: точка в правом нижнем углу + текст для скринридера. */
  status?: AvatarStatus;
  /** Классы точки статуса. */
  statusClassName?: string;
}

/** Обрезка по форме аватара: точка статуса лежит снаружи и не срезается. */
const CONTENT_CLASS =
  "flex h-full w-full items-center justify-center overflow-hidden rounded-[inherit]";

const IMAGE_CLASS = "h-full w-full object-cover";

const getInitials = (name?: string): string => {
  if (!name) return "";

  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map(part => part[0])
    .join("");
};

const joinLabel = (name: string, status?: AvatarStatus): string =>
  status ? `${name}, ${AVATAR_STATUS_LABEL[status]}` : name;

const Avatar = React.forwardRef<HTMLSpanElement, AvatarProps>(
  (
    {
      className,
      size,
      shape,
      src,
      alt,
      name,
      fallback,
      status,
      statusClassName,
      children,
      ...props
    },
    ref,
  ) => {
    const [erroredSrc, setErroredSrc] = React.useState<string | null>(null);

    const showImage = Boolean(src) && erroredSrc !== src;
    const accessibleName = alt ?? name;
    // `false` / `""` из условного рендера — «нет содержимого», а не содержимое.
    const content = children === false || children === "" ? null : children;
    const fallbackNode = content ?? fallback ?? (getInitials(name) || null);
    // Корень с role="img" делает потомков презентационными:
    // тогда статус входит в его имя, а точка — только декор.
    const labelledRoot = !showImage && !!accessibleName;

    const handleError = () => setErroredSrc(src ?? null);

    return (
      <span
        ref={ref}
        role={labelledRoot ? "img" : undefined}
        aria-label={
          labelledRoot && accessibleName
            ? joinLabel(accessibleName, status)
            : undefined
        }
        className={cn(avatarVariants({ size, shape }), className)}
        {...props}
      >
        <span className={CONTENT_CLASS}>
          {showImage ? (
            <img
              src={src}
              alt={accessibleName ?? ""}
              className={IMAGE_CLASS}
              onError={handleError}
            />
          ) : (
            fallbackNode
          )}
        </span>
        {status && (
          <AvatarStatusDot
            status={status}
            size={size}
            decorative={labelledRoot}
            className={statusClassName}
          />
        )}
      </span>
    );
  },
);

Avatar.displayName = "Avatar";

export { Avatar };
