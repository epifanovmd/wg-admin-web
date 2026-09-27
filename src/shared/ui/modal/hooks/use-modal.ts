import * as React from "react";

import {
  ModalContext,
  type ModalContextValue,
} from "../provider/modal-context";

export const useModal = (): ModalContextValue => {
  const ctx = React.useContext(ModalContext);

  if (!ctx) throw new Error("useModal must be used within <ModalProvider>");

  return ctx;
};
