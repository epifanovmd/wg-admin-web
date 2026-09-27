import * as DialogPrimitive from "@radix-ui/react-dialog";
import { useControllableState } from "@shared/lib/hooks";
import * as React from "react";

import { ModalOpenContext } from "../modal-open-context";

export type ModalProps = React.ComponentPropsWithoutRef<
  typeof DialogPrimitive.Root
>;

/** Корень окна: владеет состоянием `open` (controlled или uncontrolled). */
export const ModalRoot = ({
  open,
  defaultOpen = false,
  onOpenChange,
  children,
  ...props
}: ModalProps) => {
  const [isOpen, setOpen] = useControllableState({
    value: open,
    defaultValue: defaultOpen,
    onChange: onOpenChange,
  });

  const ctx = React.useMemo(
    () => ({ open: isOpen, setOpen }),
    [isOpen, setOpen],
  );

  return (
    <ModalOpenContext.Provider value={ctx}>
      <DialogPrimitive.Root open={isOpen} onOpenChange={setOpen} {...props}>
        {children}
      </DialogPrimitive.Root>
    </ModalOpenContext.Provider>
  );
};
