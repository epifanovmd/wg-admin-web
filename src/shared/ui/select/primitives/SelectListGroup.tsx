import { cn } from "@shared/lib/utils";
import * as React from "react";

import { selectGroupLabelClasses } from "../select-variants";

export interface SelectListGroupProps {
  label: string;
  className?: string;
  children?: React.ReactNode;
}

export const SelectListGroup = ({
  label,
  className,
  children,
}: SelectListGroupProps) => {
  const labelId = React.useId();

  return (
    <div
      role="group"
      aria-labelledby={labelId}
      className={cn("py-1", className)}
    >
      <div id={labelId} className={selectGroupLabelClasses}>
        {label}
      </div>
      {children}
    </div>
  );
};
