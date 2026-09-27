import * as PopoverPrimitive from "@radix-ui/react-popover";
import type * as React from "react";

import type { DropdownPlacementProps } from "../types";
import { SelectPopoverContent } from "./SelectPopoverContent";

export interface SelectDropdownProps extends Omit<
  DropdownPlacementProps,
  "listClassName" | "maxHeight"
> {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Не рендерить контент дропдауна. */
  hidden?: boolean;
  closeOnTriggerClick?: boolean;
  /** `trigger` — элемент сам открывает попап по клику (поле с инпутом);
   *  `anchor` — элемент только задаёт позицию и ширину, триггер внутри
   *  (`SelectTriggerButton`). */
  triggerMode?: "trigger" | "anchor";
  /** Элемент, принимающий ref и пропсы (asChild). */
  trigger: React.ReactElement;
  children: React.ReactNode;
}

/** Оболочка выпадающего списка: Popover + позиционирование контента. */
export const SelectDropdown = ({
  open,
  onOpenChange,
  hidden,
  closeOnTriggerClick = true,
  triggerMode = "trigger",
  trigger,
  children,
  dropdownSide,
  dropdownAlign,
  dropdownSideOffset,
  dropdownAlignOffset,
  dropdownAvoidCollisions,
  dropdownCollisionPadding,
  dropdownWidth,
  dropdownMaxWidth,
  dropdownContainer,
}: SelectDropdownProps) => {
  // preventDefault отменяет встроенный toggle Radix-триггера
  const handleTriggerClick = (e: React.MouseEvent) => {
    if (!closeOnTriggerClick && open) e.preventDefault();
  };

  const anchor =
    triggerMode === "anchor" ? (
      <PopoverPrimitive.Anchor asChild>{trigger}</PopoverPrimitive.Anchor>
    ) : (
      <PopoverPrimitive.Trigger asChild onClick={handleTriggerClick}>
        {trigger}
      </PopoverPrimitive.Trigger>
    );

  return (
    <PopoverPrimitive.Root open={open} onOpenChange={onOpenChange}>
      {anchor}
      {hidden ? null : (
        <SelectPopoverContent
          side={dropdownSide}
          align={dropdownAlign}
          sideOffset={dropdownSideOffset}
          alignOffset={dropdownAlignOffset}
          avoidCollisions={dropdownAvoidCollisions}
          collisionPadding={dropdownCollisionPadding}
          width={dropdownWidth}
          maxWidth={dropdownMaxWidth}
          container={dropdownContainer}
        >
          {children}
        </SelectPopoverContent>
      )}
    </PopoverPrimitive.Root>
  );
};
