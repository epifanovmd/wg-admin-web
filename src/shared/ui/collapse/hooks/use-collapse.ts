import { useControllableState } from "@shared/lib/hooks";
import * as React from "react";

export interface UseCollapseOptions {
  open?: boolean;
  defaultOpen?: boolean;
  disabled?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export interface UseCollapseResult {
  isOpen: boolean;
  disabled: boolean;
  toggle: () => void;
  open: () => void;
  close: () => void;
  setOpen: (value: boolean) => void;
}

/** Состояние раскрытия (controlled/uncontrolled); результат мемоизирован. */
export const useCollapse = ({
  open: openProp,
  defaultOpen = false,
  disabled = false,
  onOpenChange,
}: UseCollapseOptions = {}): UseCollapseResult => {
  const [isOpen, setOpenState] = useControllableState({
    value: openProp,
    defaultValue: defaultOpen,
    onChange: onOpenChange,
  });

  const setOpen = React.useCallback(
    (value: boolean) => {
      if (disabled) return;
      setOpenState(value);
    },
    [disabled, setOpenState],
  );

  const toggle = React.useCallback(() => {
    if (disabled) return;
    setOpenState(prev => !prev);
  }, [disabled, setOpenState]);

  const open = React.useCallback(() => setOpen(true), [setOpen]);
  const close = React.useCallback(() => setOpen(false), [setOpen]);

  return React.useMemo(
    () => ({ isOpen, disabled, toggle, open, close, setOpen }),
    [isOpen, disabled, toggle, open, close, setOpen],
  );
};
