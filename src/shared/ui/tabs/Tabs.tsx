import * as TabsPrimitive from "@radix-ui/react-tabs";
import * as React from "react";

/** Индикатор `TabsList` рассчитан на горизонтальный список — `orientation` не поддерживается. */
export type TabsProps = Omit<
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Root>,
  "orientation"
>;

const Tabs = React.forwardRef<
  React.ComponentRef<typeof TabsPrimitive.Root>,
  TabsProps
>((props, ref) => <TabsPrimitive.Root ref={ref} {...props} />);

Tabs.displayName = "Tabs";

export { Tabs };
