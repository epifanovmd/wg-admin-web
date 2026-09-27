import { cn } from "@shared/lib/utils";
import * as React from "react";

import {
  Modal,
  ModalContent,
  type ModalContentProps,
  ModalDescription,
  type ModalProps,
  ModalTitle,
} from "../modal";
import { Command, type CommandProps } from "./Command";

export interface CommandDialogProps extends ModalProps {
  /** Заголовок для скринридеров (визуально скрыт). */
  title?: React.ReactNode;
  /** Описание для скринридеров (визуально скрыто). */
  description?: React.ReactNode;
  /** Пропсы корня `Command`: `filter`, `shouldFilter`, `loop`, `value`… */
  commandProps?: CommandProps;
  /** Классы окна. */
  className?: string;
  /** Пропсы окна: `position`, `size`, обработчики закрытия. */
  contentProps?: Omit<ModalContentProps, "children" | "className">;
}

const CONTENT_CLASS = "overflow-hidden p-0";
const COMMAND_CLASS = "rounded-xl bg-background";

/**
 * Командная панель в модальном окне. Открытие — `open`/`onOpenChange`
 * (или `defaultOpen`); вместе с `useCommandShortcut` открывается по Ctrl/Cmd+K.
 */
export const CommandDialog = ({
  title = "Командная панель",
  description = "Введите команду или название раздела",
  commandProps,
  className,
  contentProps,
  children,
  ...rootProps
}: CommandDialogProps) => (
  <Modal {...rootProps}>
    <ModalContent
      position="top"
      hideCloseButton
      className={cn(CONTENT_CLASS, className)}
      {...contentProps}
    >
      <ModalTitle className="sr-only">{title}</ModalTitle>
      <ModalDescription className="sr-only">{description}</ModalDescription>
      <Command
        {...commandProps}
        className={cn(COMMAND_CLASS, commandProps?.className)}
      >
        {children}
      </Command>
    </ModalContent>
  </Modal>
);
