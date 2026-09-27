import { cn } from "@shared/lib/utils";
import { type VariantProps } from "class-variance-authority";
import {
  AlertTriangle,
  Database,
  Inbox,
  type LucideIcon,
  Package,
  PackageSearch,
  Search,
} from "lucide-react";
import * as React from "react";

import { emptyIconVariants } from "./empty-variants";

export type EmptyIconName =
  "inbox" | "search" | "package" | "database" | "question" | "error";

const ICON_MAP: Record<EmptyIconName, LucideIcon> = {
  inbox: Inbox,
  search: Search,
  package: Package,
  database: Database,
  question: PackageSearch,
  error: AlertTriangle,
};

export interface EmptyIconProps extends VariantProps<typeof emptyIconVariants> {
  icon: EmptyIconName | React.ReactElement;
}

const ROOT_CLASS = "relative flex items-center justify-center";
const GLOW_CLASS = "absolute inset-0 rounded-full bg-muted/60 blur-xl";
const BOX_CLASS =
  "relative flex items-center justify-center rounded-2xl border border-border/60 bg-muted/40 p-4 shadow-sm backdrop-blur-sm";

/**
 * Иконка пустого состояния в общей подложке: именованная из набора или
 * произвольный элемент — оба варианта выглядят одинаково.
 */
export const EmptyIcon = ({ icon, size }: EmptyIconProps) => {
  const iconClassName = cn(emptyIconVariants({ size }));
  const IconComponent = React.isValidElement(icon) ? null : ICON_MAP[icon];
  const content = IconComponent ? (
    <IconComponent aria-hidden className={iconClassName} />
  ) : (
    <span aria-hidden className={cn("inline-flex", iconClassName)}>
      {icon}
    </span>
  );

  return (
    <div className={ROOT_CLASS}>
      <div className={GLOW_CLASS} />
      <div className={BOX_CLASS}>{content}</div>
    </div>
  );
};
