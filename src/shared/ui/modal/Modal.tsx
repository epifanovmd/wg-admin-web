import * as DialogPrimitive from "@radix-ui/react-dialog";

import { ModalBody } from "./components/ModalBody";
import { ModalContent } from "./components/ModalContent";
import { ModalDescription } from "./components/ModalDescription";
import { ModalFooter } from "./components/ModalFooter";
import { ModalHeader } from "./components/ModalHeader";
import { ModalRoot } from "./components/ModalRoot";
import { ModalTitle } from "./components/ModalTitle";

export const Modal = Object.assign(ModalRoot, {
  Trigger: DialogPrimitive.Trigger,
  Close: DialogPrimitive.Close,
  Content: ModalContent,
  Header: ModalHeader,
  Body: ModalBody,
  Footer: ModalFooter,
  Title: ModalTitle,
  Description: ModalDescription,
});
