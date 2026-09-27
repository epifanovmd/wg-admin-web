import type { VariantProps } from "class-variance-authority";
import * as React from "react";

import type { tabsListVariants } from "./tabs-variants";

export type TabsContextValue = Pick<
  VariantProps<typeof tabsListVariants>,
  "variant" | "size"
>;

export const TabsContext = React.createContext<TabsContextValue>({
  variant: "default",
  size: "md",
});
