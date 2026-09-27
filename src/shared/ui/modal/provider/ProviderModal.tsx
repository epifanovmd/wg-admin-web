import * as React from "react";

import { ModalContent } from "../components/ModalContent";
import { ModalRoot } from "../components/ModalRoot";
import { type ModalEntry, type ModalRenderProps } from "./modal-context";

export interface ProviderModalProps {
  entry: ModalEntry;
  onClose: (id: string) => void;
}

/** Одно окно, открытое через `ModalProvider.openModal`. */
export const ProviderModal = ({ entry, onClose }: ProviderModalProps) => {
  const { id, open, options } = entry;
  const { content, onClose: _entryOnClose, ...contentProps } = options;

  const renderProps: ModalRenderProps = { id, onClose: () => onClose(id) };

  const body = typeof content === "function" ? content(renderProps) : content;

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) onClose(id);
  };

  return (
    <ModalRoot open={open} onOpenChange={handleOpenChange}>
      <ModalContent {...contentProps}>{body}</ModalContent>
    </ModalRoot>
  );
};
