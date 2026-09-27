import * as React from "react";

import { Button, type ButtonProps } from "../../button";
import { ModalFooter } from "./ModalFooter";

export interface ModalConfirmFooterProps {
  showCancel: boolean;
  showConfirm: boolean;
  cancelLabel: string;
  cancelVariant: ButtonProps["variant"];
  confirmLabel: string;
  confirmVariant: ButtonProps["variant"];
  loading: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

/** Подвал режима подтверждения: «Отмена» и «Подтвердить». */
export const ModalConfirmFooter = ({
  showCancel,
  showConfirm,
  cancelLabel,
  cancelVariant,
  confirmLabel,
  confirmVariant,
  loading,
  onCancel,
  onConfirm,
}: ModalConfirmFooterProps) => (
  <ModalFooter>
    {showCancel && (
      <Button
        type="button"
        variant={cancelVariant}
        onClick={onCancel}
        disabled={loading}
      >
        {cancelLabel}
      </Button>
    )}
    {showConfirm && (
      <Button
        type="button"
        variant={confirmVariant}
        onClick={onConfirm}
        loading={loading}
      >
        {confirmLabel}
      </Button>
    )}
  </ModalFooter>
);
