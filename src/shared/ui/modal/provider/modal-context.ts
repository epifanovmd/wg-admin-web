import * as React from "react";

import { type ModalContentProps } from "../components/ModalContent";

export interface ModalRenderProps {
  id: string;
  onClose: () => void;
}

export type ModalContentRenderer =
  React.ReactNode | ((props: ModalRenderProps) => React.ReactNode);

export type ModalContentOptions = Pick<
  ModalContentProps,
  | "size"
  | "position"
  | "fullScreenOnMobile"
  | "disableInteractOutside"
  | "hideCloseButton"
  | "title"
  | "description"
  | "footer"
  | "onConfirm"
  | "onConfirmError"
  | "confirmLabel"
  | "confirmVariant"
  | "onCancel"
  | "cancelLabel"
  | "cancelVariant"
>;

export interface ModalOptions extends ModalContentOptions {
  content?: ModalContentRenderer;
  /** Вызывается один раз при любом закрытии окна. */
  onClose?: () => void;
}

export interface ModalConfirmOptions extends Pick<
  ModalContentProps,
  | "title"
  | "description"
  | "confirmLabel"
  | "confirmVariant"
  | "cancelLabel"
  | "onConfirm"
  | "onConfirmError"
> {
  size?: "sm" | "md";
}

export interface ModalEntry {
  id: string;
  open: boolean;
  options: ModalOptions;
}

export interface ModalContextValue {
  openModal: (options: ModalOptions) => string;
  closeModal: (id: string) => void;
  closeAll: () => void;
  /**
   * Окно подтверждения. Разрешается `true` после успешного `onConfirm`,
   * `false` при отмене или любом другом закрытии (в том числе `closeAll`).
   */
  confirm: (options: ModalConfirmOptions) => Promise<boolean>;
}

export const ModalContext = React.createContext<ModalContextValue | null>(null);
