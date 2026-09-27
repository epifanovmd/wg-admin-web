import * as React from "react";

import { Empty, type EmptyProps } from "../empty";
import { PageStateFrame } from "./PageStateFrame";

export interface PageEmptyProps extends EmptyProps {
  /** Класс внешней обёртки, занимающей страницу; `className` уходит в `Empty`. */
  frameClassName?: string;
}

const PageEmpty = React.forwardRef<HTMLDivElement, PageEmptyProps>(
  ({ frameClassName, ...props }, ref) => (
    <PageStateFrame className={frameClassName}>
      <Empty ref={ref} {...props} />
    </PageStateFrame>
  ),
);

PageEmpty.displayName = "PageEmpty";

export { PageEmpty };
