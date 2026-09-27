import * as React from "react";

export interface ModalOpenContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
}

/**
 * Состояние окна, которым владеет `ModalRoot`. Содержимому оно нужно, чтобы
 * закрыть окно из кнопок подтверждения и заморозить последний кадр на время
 * анимации закрытия (см. `ModalContent`).
 */
export const ModalOpenContext =
  React.createContext<ModalOpenContextValue | null>(null);

export const useModalOpen = (): ModalOpenContextValue => {
  const ctx = React.useContext(ModalOpenContext);

  if (!ctx) {
    throw new Error("Modal compound components must be used within <Modal>");
  }

  return ctx;
};
