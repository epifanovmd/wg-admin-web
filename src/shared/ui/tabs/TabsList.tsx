import { useMergedRef } from "@mantine/hooks";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { useSmoothHorizontalScroll } from "@shared/lib/hooks";
import { cn } from "@shared/lib/utils";
import type { VariantProps } from "class-variance-authority";
import { motion, useReducedMotion } from "motion/react";
import * as React from "react";

import { useActiveIndicator } from "../foundation";
import { TabsContext, type TabsContextValue } from "./tabs-context";
import { tabsIndicatorVariants, tabsListVariants } from "./tabs-variants";

export interface TabsListProps
  extends
    React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>,
    VariantProps<typeof tabsListVariants> {}

const INDICATOR_TRANSITION = { duration: 0.2, ease: "easeInOut" } as const;
const INSTANT_TRANSITION = { duration: 0 } as const;

const TabsList = React.forwardRef<
  React.ComponentRef<typeof TabsPrimitive.List>,
  TabsListProps
>(({ className, variant, size, children, ...props }, ref) => {
  const listRef = React.useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();
  const { scrollToCenter } = useSmoothHorizontalScroll(listRef);
  const { containerRef, rect, animated } = useActiveIndicator<HTMLDivElement>({
    activeSelector: '[data-state="active"]',
    itemsKey: React.Children.count(children),
    observeAttributes: ["data-state"],
    onActiveChange: scrollToCenter,
  });
  const mergedRef = useMergedRef(ref, listRef, containerRef);

  const ctxValue = React.useMemo<TabsContextValue>(
    () => ({ variant, size }),
    [variant, size],
  );
  const transition =
    animated && !shouldReduceMotion ? INDICATOR_TRANSITION : INSTANT_TRANSITION;

  return (
    <TabsContext.Provider value={ctxValue}>
      <TabsPrimitive.List
        ref={mergedRef}
        className={cn(tabsListVariants({ variant, size }), className)}
        {...props}
      >
        {rect && (
          <motion.div
            aria-hidden
            className={tabsIndicatorVariants({ variant })}
            initial={false}
            animate={{ x: rect.x, width: rect.width }}
            transition={transition}
          />
        )}
        {children}
      </TabsPrimitive.List>
    </TabsContext.Provider>
  );
});

TabsList.displayName = "TabsList";

export { TabsList };
