import { cn } from "@shared/lib/utils";
import * as React from "react";

import { useCollapse, type UseCollapseOptions } from "../hooks/use-collapse";
import {
  CollapseContext,
  type CollapseContextValue,
  type CollapseSize,
  type CollapseVariant,
} from "./collapse-context";

export interface CollapseProps
  extends UseCollapseOptions, React.HTMLAttributes<HTMLDivElement> {
  variant?: CollapseVariant;
  size?: CollapseSize;
}

export const CollapseRoot = React.forwardRef<HTMLDivElement, CollapseProps>(
  (
    {
      open,
      defaultOpen,
      disabled,
      onOpenChange,
      variant = "ghost",
      size = "md",
      children,
      className,
      ...props
    },
    ref,
  ) => {
    const collapse = useCollapse({ open, defaultOpen, disabled, onOpenChange });
    const id = React.useId();

    const ctx = React.useMemo<CollapseContextValue>(
      () => ({
        ...collapse,
        triggerId: `collapse-trigger-${id}`,
        contentId: `collapse-content-${id}`,
        variant,
        size,
      }),
      [collapse, id, variant, size],
    );

    return (
      <CollapseContext.Provider value={ctx}>
        <div ref={ref} className={cn("w-full", className)} {...props}>
          {children}
        </div>
      </CollapseContext.Provider>
    );
  },
);

CollapseRoot.displayName = "Collapse";
