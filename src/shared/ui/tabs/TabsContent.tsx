import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cn } from "@shared/lib/utils";
import * as React from "react";

export type TabsContentProps = React.ComponentPropsWithoutRef<
  typeof TabsPrimitive.Content
>;

const CONTENT_CLASS =
  "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";

const TabsContent = React.forwardRef<
  React.ComponentRef<typeof TabsPrimitive.Content>,
  TabsContentProps
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(CONTENT_CLASS, className)}
    {...props}
  />
));

TabsContent.displayName = "TabsContent";

export { TabsContent };
