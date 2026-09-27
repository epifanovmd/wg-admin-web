import * as DialogPrimitive from "@radix-ui/react-dialog";
import { cn } from "@shared/lib/utils";
import { type VariantProps } from "class-variance-authority";
import { X } from "lucide-react";
import * as React from "react";

import { type ButtonProps } from "../../button";
import { IconButton } from "../../icon-button";
import { useModalOpen } from "../modal-open-context";
import {
  MODAL_CLOSE_FULL_SCREEN_MOBILE_CLASS,
  modalContentVariants,
} from "./modal-variants";
import { ModalBody } from "./ModalBody";
import { ModalConfirmFooter } from "./ModalConfirmFooter";
import { ModalDescription } from "./ModalDescription";
import { ModalFooter } from "./ModalFooter";
import { ModalHeader } from "./ModalHeader";
import { ModalOverlay } from "./ModalOverlay";
import { ModalTitle } from "./ModalTitle";

type ContentProps = Omit<
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>,
  "title"
>;

type ModalVariantProps = VariantProps<typeof modalContentVariants>;

export interface ModalContentProps
  extends ContentProps, Omit<ModalVariantProps, "fullScreenOnMobile"> {
  /**
   * Ниже брейкпоинта `sm` окно занимает весь экран: без скруглений, с
   * прокручиваемым телом и отступами под safe-area.
   */
  fullScreenOnMobile?: boolean;
  /** Запрещает закрывать окно по ESC и клику вне его. */
  disableInteractOutside?: boolean;
  hideCloseButton?: boolean;

  title?: React.ReactNode;
  description?: React.ReactNode;
  footer?: React.ReactNode;

  /**
   * Режим подтверждения: пока промис не завершится, кнопка показывает
   * ожидание; после успеха окно закрывается. Если промис отклонён, окно
   * остаётся открытым, ошибка уходит в `onConfirmError`, а без него —
   * пробрасывается дальше.
   */
  onConfirm?: () => void | Promise<void>;
  onConfirmError?: (error: unknown) => void;
  confirmLabel?: string;
  confirmVariant?: ButtonProps["variant"];
  /**
   * В режиме подтверждения вызывается при любом закрытии без подтверждения:
   * «Отмена», крестик, ESC, клик по оверлею.
   */
  onCancel?: () => void;
  cancelLabel?: string;
  cancelVariant?: ButtonProps["variant"];
}

const CLOSE_BUTTON_CLASS = "absolute right-3 top-3";

const ModalContent = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Content>,
  ModalContentProps
>(
  (
    {
      className,
      children,
      position,
      size,
      fullScreenOnMobile = false,
      disableInteractOutside,
      hideCloseButton,
      title,
      description,
      footer,
      onConfirm,
      onConfirmError,
      confirmLabel = "Подтвердить",
      confirmVariant = "primary",
      onCancel,
      cancelLabel = "Отмена",
      cancelVariant = "outline",
      onEscapeKeyDown,
      onPointerDownOutside,
      ...props
    },
    ref,
  ) => {
    const { open, setOpen } = useModalOpen();
    const [confirmLoading, setConfirmLoading] = React.useState(false);

    /**
     * Пока играет анимация закрытия, Radix держит окно смонтированным, а
     * данные под ним уже обнулились: `open={!!model}` и `{model && <Body/>}`
     * дают пустое окно на две десятых секунды. Поэтому на время закрытия
     * содержимое замораживается — последний виденный кадр и доигрывает.
     */
    const view = { children, title, description, footer };
    const frozen = React.useRef(view);

    if (open) frozen.current = view;

    const shown = open ? view : frozen.current;

    const isConfirmMode = onConfirm !== undefined || onCancel !== undefined;
    const isSkeletonMode =
      shown.title !== undefined || shown.footer !== undefined || isConfirmMode;

    const handleConfirm = async () => {
      setConfirmLoading(true);
      try {
        await onConfirm?.();
        setOpen(false);
      } catch (error) {
        if (!onConfirmError) throw error;
        onConfirmError(error);
      } finally {
        setConfirmLoading(false);
      }
    };

    const handleCancel = () => {
      onCancel?.();
      setOpen(false);
    };

    const handleDismiss = () => {
      if (isConfirmMode) onCancel?.();
      setOpen(false);
    };

    const handleEscapeKeyDown = (event: KeyboardEvent) => {
      onEscapeKeyDown?.(event);

      if (disableInteractOutside) {
        event.preventDefault();

        return;
      }

      if (isConfirmMode && !event.defaultPrevented) onCancel?.();
    };

    const handlePointerDownOutside: ContentProps["onPointerDownOutside"] =
      event => {
        onPointerDownOutside?.(event);

        if (disableInteractOutside) {
          event.preventDefault();

          return;
        }

        if (isConfirmMode && !event.defaultPrevented) onCancel?.();
      };

    const customFooter =
      shown.footer !== undefined ? (
        <ModalFooter>{shown.footer}</ModalFooter>
      ) : null;

    const confirmFooter = isConfirmMode ? (
      <ModalConfirmFooter
        showCancel={onCancel !== undefined}
        showConfirm={onConfirm !== undefined}
        cancelLabel={cancelLabel}
        cancelVariant={cancelVariant}
        confirmLabel={confirmLabel}
        confirmVariant={confirmVariant}
        loading={confirmLoading}
        onCancel={handleCancel}
        onConfirm={handleConfirm}
      />
    ) : null;

    const footerNode = customFooter ?? confirmFooter;

    const headerNode =
      shown.title !== undefined ? (
        <ModalHeader>
          <ModalTitle>{shown.title}</ModalTitle>
          {shown.description && (
            <ModalDescription>{shown.description}</ModalDescription>
          )}
        </ModalHeader>
      ) : null;

    const bodyNode = isSkeletonMode ? (
      <>
        {headerNode}
        {shown.children && <ModalBody>{shown.children}</ModalBody>}
        {footerNode}
      </>
    ) : (
      shown.children
    );

    return (
      <DialogPrimitive.Portal>
        <ModalOverlay />
        <DialogPrimitive.Content
          ref={ref}
          className={cn(
            modalContentVariants({ position, size, fullScreenOnMobile }),
            className,
          )}
          onEscapeKeyDown={handleEscapeKeyDown}
          onPointerDownOutside={handlePointerDownOutside}
          {...props}
        >
          {bodyNode}

          {!hideCloseButton && (
            <IconButton
              type="button"
              size="xs"
              aria-label="Закрыть"
              className={cn(
                CLOSE_BUTTON_CLASS,
                fullScreenOnMobile && MODAL_CLOSE_FULL_SCREEN_MOBILE_CLASS,
              )}
              onClick={handleDismiss}
            >
              <X size={14} aria-hidden />
            </IconButton>
          )}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    );
  },
);

ModalContent.displayName = "ModalContent";

export { ModalContent };
