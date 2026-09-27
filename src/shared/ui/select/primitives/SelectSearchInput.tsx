import { cn } from "@shared/lib/utils";
import * as React from "react";

import { selectSearchInputClasses } from "../select-variants";

export type SelectSearchInputProps =
  React.InputHTMLAttributes<HTMLInputElement>;

/** Поисковый инпут внутри триггера (Select с `search`, Autocomplete). */
export const SelectSearchInput = React.forwardRef<
  HTMLInputElement,
  SelectSearchInputProps
>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    autoComplete="off"
    aria-autocomplete="list"
    className={cn(selectSearchInputClasses, className)}
    {...props}
  />
));

SelectSearchInput.displayName = "SelectSearchInput";
