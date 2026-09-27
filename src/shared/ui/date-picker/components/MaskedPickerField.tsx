import { useMergedRef } from "@mantine/hooks";
import { Calendar as CalendarIcon } from "lucide-react";
import * as React from "react";

import { Input } from "../../input";
import { Popover, type PopoverContentProps } from "../../popover";
import type { DatePickerTriggerVariantProps } from "./date-picker-variants";

export interface MaskedPickerFieldProps extends DatePickerTriggerVariantProps {
  /** Ref на `<input>` от imask (для фокуса и фильтра interact-outside). */
  inputRef: React.RefObject<HTMLInputElement | null>;
  forwardedRef: React.ForwardedRef<HTMLInputElement>;
  id?: string;
  name?: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  /** Стартовое значение в DOM до инициализации imask. */
  defaultValue: string;
  hasValue: boolean;
  clearable?: boolean;
  onClear: () => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Открывать календарь при фокусе инпута (фокус остаётся в инпуте). */
  openOnFocus?: boolean;
  contentProps?: Partial<PopoverContentProps>;
  /** Иконка кнопки открытия попапа (по умолчанию — календарь). */
  triggerIcon?: React.ReactNode;
  /** Доступное имя кнопки открытия попапа. */
  triggerLabel?: string;
  /** Элемент попапа, получающий фокус при открытии с клавиатуры. */
  focusSelector?: string;
  /** Тип попапа для `aria-haspopup`. */
  popupType?: "dialog" | "listbox";
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  onFocus?: React.FocusEventHandler<HTMLInputElement>;
  onBlur?: React.FocusEventHandler<HTMLInputElement>;
  "aria-label"?: string;
  "aria-describedby"?: string;
  "aria-invalid"?: boolean;
  "aria-labelledby"?: string;
  "aria-required"?: boolean;
  children: React.ReactNode;
}

const TRIGGER_CLASS =
  "pointer-events-auto cursor-pointer rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50";

/** Якорь попапа — всё поле, чтобы попап открывался под ним, а не под иконкой. */
const ANCHOR_CLASS = "w-full";
const CONTENT_SIDE_OFFSET = 4;

const FOCUSABLE_CELL_SELECTOR = '[data-date][tabindex="0"]';
const CALENDAR_ICON = <CalendarIcon aria-hidden className="h-4 w-4" />;

/** Клик по иконке мышью не уводит фокус из инпута. */
const preventFocusSteal = (event: React.MouseEvent) => event.preventDefault();

/**
 * Поле масочного пикера: `Input` с кнопкой попапа в `leftIcon` и
 * `Popover.Content` (календарь, список времени). ArrowDown в инпуте
 * открывает попап и переводит фокус в него (`focusSelector`); Escape
 * возвращает фокус в инпут.
 */
export const MaskedPickerField = ({
  inputRef,
  forwardedRef,
  id,
  name,
  placeholder,
  disabled,
  className,
  defaultValue,
  hasValue,
  clearable,
  onClear,
  open,
  onOpenChange,
  openOnFocus = false,
  contentProps,
  triggerIcon = CALENDAR_ICON,
  triggerLabel = "Открыть календарь",
  focusSelector = FOCUSABLE_CELL_SELECTOR,
  popupType = "dialog",
  inputMode,
  size,
  variant,
  onFocus,
  onBlur,
  "aria-label": ariaLabel,
  "aria-describedby": ariaDescribedBy,
  "aria-invalid": ariaInvalid,
  "aria-labelledby": ariaLabelledBy,
  "aria-required": ariaRequired,
  children,
}: MaskedPickerFieldProps) => {
  const contentRef = React.useRef<HTMLDivElement>(null);
  const focusCalendarOnOpenRef = React.useRef(false);
  /** Попап закрыт взаимодействием снаружи — фокус уже ушёл, возвращать его нельзя. */
  const closedOutsideRef = React.useRef(false);
  /** Фокус возвращается программно — `openOnFocus` не должен открыть попап снова. */
  const restoringFocusRef = React.useRef(false);
  const mergedRef = useMergedRef(forwardedRef, inputRef);

  const focusCalendar = () => {
    contentRef.current?.querySelector<HTMLElement>(focusSelector)?.focus();
  };

  const handleInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== "ArrowDown") return;
    event.preventDefault();

    if (open) {
      focusCalendar();
    } else {
      focusCalendarOnOpenRef.current = true;
      onOpenChange(true);
    }
  };

  const handleInputFocus = (event: React.FocusEvent<HTMLInputElement>) => {
    if (openOnFocus && !restoringFocusRef.current) onOpenChange(true);
    onFocus?.(event);
  };

  // С openOnFocus клик в уже сфокусированное поле открывает попап, как у Select.
  const handleInputClick = () => {
    if (openOnFocus && !open) onOpenChange(true);
  };

  const handleOpenAutoFocus = (event: Event) => {
    event.preventDefault();
    closedOutsideRef.current = false;
    if (focusCalendarOnOpenRef.current || !openOnFocus) focusCalendar();
    focusCalendarOnOpenRef.current = false;
  };

  const restoreInputFocus = () => {
    const input = inputRef.current;

    if (!input || input === document.activeElement) return;
    restoringFocusRef.current = true;
    input.focus();
    restoringFocusRef.current = false;
  };

  const handleCloseAutoFocus = (event: Event) => {
    event.preventDefault();
    if (!closedOutsideRef.current) restoreInputFocus();
    closedOutsideRef.current = false;
  };

  // Клик в инпут при открытом попапе (openOnFocus) не должен его закрывать.
  const handleInteractOutside = (event: Event) => {
    if (event.target === inputRef.current) {
      event.preventDefault();

      return;
    }
    closedOutsideRef.current = true;
  };

  const trigger = (
    <Popover.Trigger asChild>
      <button
        type="button"
        disabled={disabled}
        aria-label={triggerLabel}
        onMouseDown={preventFocusSteal}
        className={TRIGGER_CLASS}
      >
        {triggerIcon}
      </button>
    </Popover.Trigger>
  );

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <Popover.Anchor className={ANCHOR_CLASS}>
        <Input
          ref={mergedRef}
          id={id}
          name={name}
          data-state={open ? "open" : "closed"}
          defaultValue={defaultValue}
          hasValue={hasValue}
          placeholder={placeholder}
          disabled={disabled}
          className={className}
          size={size}
          variant={variant}
          clearable={clearable}
          clearAriaLabel="Очистить"
          onClear={onClear}
          onFocus={handleInputFocus}
          onClick={handleInputClick}
          onBlur={onBlur}
          onKeyDown={handleInputKeyDown}
          aria-label={ariaLabel}
          aria-describedby={ariaDescribedBy}
          aria-invalid={ariaInvalid}
          aria-labelledby={ariaLabelledBy}
          aria-required={ariaRequired}
          aria-haspopup={popupType}
          inputMode={inputMode}
          aria-expanded={open}
          leftIcon={trigger}
        />
      </Popover.Anchor>
      <Popover.Content
        ref={contentRef}
        size="none"
        align="start"
        sideOffset={CONTENT_SIDE_OFFSET}
        onOpenAutoFocus={handleOpenAutoFocus}
        onCloseAutoFocus={handleCloseAutoFocus}
        onInteractOutside={handleInteractOutside}
        {...contentProps}
      >
        {children}
      </Popover.Content>
    </Popover>
  );
};
