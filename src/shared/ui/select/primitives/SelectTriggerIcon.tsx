import { ChevronDown } from "lucide-react";

import { Spinner } from "../../spinner";

export interface SelectTriggerIconProps {
  loading?: boolean;
  /** Не показывать шеврон, когда нет loading. */
  hideChevron?: boolean;
}

export const SelectTriggerIcon = ({
  loading,
  hideChevron,
}: SelectTriggerIconProps) => {
  if (loading) {
    return <Spinner size="sm" className="h-4 w-4 opacity-50 shrink-0" />;
  }

  if (hideChevron) return null;

  return <ChevronDown aria-hidden className="h-4 w-4 opacity-50 shrink-0" />;
};
