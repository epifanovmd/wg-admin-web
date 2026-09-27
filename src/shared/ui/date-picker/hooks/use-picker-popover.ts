import { useControllableState, useLatestRef } from "@shared/lib/hooks";
import { useCallback, useState } from "react";

export interface UsePickerPopoverOptions {
  /** Управляемое состояние открытия. */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export interface UsePickerPopoverResult {
  open: boolean;
  setOpen: (open: boolean) => void;
  close: () => void;
  /** Дата под курсором в календаре (только пока попап открыт). */
  hoverDate: Date | undefined;
  handleDateHover: (date: Date | undefined) => void;
}

/** Общее состояние попапа пикеров: открытие + hover-дата для превью. */
export const usePickerPopover = ({
  open: openProp,
  onOpenChange,
}: UsePickerPopoverOptions = {}): UsePickerPopoverResult => {
  const [open, setOpenState] = useControllableState({
    value: openProp,
    defaultValue: false,
    onChange: onOpenChange,
  });
  const [hoverDate, setHoverDate] = useState<Date | undefined>();
  const openRef = useLatestRef(open);

  const setOpen = useCallback(
    (next: boolean) => {
      setOpenState(next);
      if (!next) setHoverDate(undefined);
    },
    [setOpenState],
  );

  const close = useCallback(() => setOpen(false), [setOpen]);

  // Во время exit-анимации контент ещё ловит mouseenter — hover после
  // закрытия игнорируем.
  const handleDateHover = useCallback(
    (date: Date | undefined) => {
      if (!openRef.current && date !== undefined) return;
      setHoverDate(date);
    },
    [openRef],
  );

  return { open, setOpen, close, hoverDate, handleDateHover };
};
