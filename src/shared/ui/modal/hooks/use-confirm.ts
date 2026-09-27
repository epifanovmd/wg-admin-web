import { useModal } from "./use-modal";

/** Окно подтверждения из `ModalProvider`: `await confirm({...})` → `boolean`. */
export const useConfirm = () => useModal().confirm;
