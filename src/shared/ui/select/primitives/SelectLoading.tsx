import { cn } from "@shared/lib/utils";

import { Spinner } from "../../spinner";

export interface SelectLoadingProps {
  className?: string;
}

export const SelectLoading = ({ className }: SelectLoadingProps) => (
  <div className={cn("flex items-center justify-center px-2 py-6", className)}>
    <Spinner size="md" />
  </div>
);
