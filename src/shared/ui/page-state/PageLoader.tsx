import * as React from "react";

import { Spinner } from "../spinner";
import { PageStateFrame, type PageStateFrameProps } from "./PageStateFrame";

export interface PageLoaderProps extends PageStateFrameProps {
  /** Подпись под спиннером. */
  label?: string;
}

const PageLoader = React.forwardRef<HTMLDivElement, PageLoaderProps>(
  ({ label, ...props }, ref) => (
    <PageStateFrame ref={ref} {...props}>
      <Spinner size="lg" label={label} className="flex-col gap-3" />
    </PageStateFrame>
  ),
);

PageLoader.displayName = "PageLoader";

export { PageLoader };
