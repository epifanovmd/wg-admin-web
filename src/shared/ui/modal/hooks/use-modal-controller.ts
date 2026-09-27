import { useLatestRef } from "@shared/lib/hooks";
import { useCallback, useMemo, useState } from "react";

export interface ModalConfig {
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Ключи окон, которые скрываются, пока открыто это. */
  suspends?: string[];
}

export interface ModalState {
  open: boolean;
  onOpen: () => void;
  onClose: () => void;
  onToggle: () => void;
}

export interface ModalController<Keys extends string> {
  modals: Record<Keys, ModalState>;
  open: (key: Keys) => void;
  close: (key: Keys) => void;
  toggle: (key: Keys) => void;
  closeAll: () => void;
  isOpen: (key: Keys) => boolean;
}

const KEY_SEPARATOR = "\u0000";
const LIST_SEPARATOR = "\u0001";

/** Управляемое `open` каждого окна одной строкой: `u` — не управляется. */
const encodeControlled = (value: boolean | undefined) =>
  value === undefined ? "u" : value ? "1" : "0";

const decodeControlled = (code: string): boolean | undefined =>
  code === "u" ? undefined : code === "1";

/**
 * Набор связанных окон с одним состоянием: стек, `suspends` для скрытия
 * родителя, `closeAll`. Конфиг может быть inline-объектом: ключи, управляемые
 * значения и `suspends` сравниваются по содержимому, а не по identity, и
 * читаются из текущего рендера — управляемое `open` применяется без задержки.
 */
export const useModalController = <Keys extends string>(
  config: Record<Keys, ModalConfig>,
): ModalController<Keys> => {
  const configRef = useLatestRef(config);

  const keysSignature = Object.keys(config).join(KEY_SEPARATOR);
  const keys = useMemo(
    () => (keysSignature ? (keysSignature.split(KEY_SEPARATOR) as Keys[]) : []),
    [keysSignature],
  );

  const controlledSignature = keys
    .map(key => encodeControlled(config[key].open))
    .join("");
  const suspendsSignature = keys
    .map(key => (config[key].suspends ?? []).join(LIST_SEPARATOR))
    .join(KEY_SEPARATOR);

  const [intent, setIntent] = useState<Record<Keys, boolean>>(() =>
    keys.reduce(
      (acc, key) => {
        acc[key] = Boolean(config[key].defaultOpen);

        return acc;
      },
      {} as Record<Keys, boolean>,
    ),
  );

  /** Фактическое состояние каждого окна: управляемое значение или своё. */
  const resolved = useMemo(
    () =>
      keys.reduce(
        (acc, key, index) => {
          const controlled = decodeControlled(controlledSignature[index]);

          acc[key] = controlled ?? Boolean(intent[key]);

          return acc;
        },
        {} as Record<Keys, boolean>,
      ),
    [keys, controlledSignature, intent],
  );

  /** Видимость с учётом `suspends`: открытое окно прячет перечисленные. */
  const visible = useMemo(() => {
    const suspendsByKey = suspendsSignature.split(KEY_SEPARATOR);
    const suspended = new Set<string>();

    keys.forEach((key, index) => {
      if (!resolved[key] || !suspendsByKey[index]) return;
      suspendsByKey[index]
        .split(LIST_SEPARATOR)
        .forEach(other => suspended.add(other));
    });

    return keys.reduce(
      (acc, key) => {
        acc[key] = resolved[key] && !suspended.has(key);

        return acc;
      },
      {} as Record<Keys, boolean>,
    );
  }, [keys, resolved, suspendsSignature]);

  const resolvedRef = useLatestRef(resolved);

  const setIntentForKey = useCallback(
    (key: Keys, value: boolean) => {
      const cfg = configRef.current[key];

      if (cfg?.open !== undefined) {
        cfg.onOpenChange?.(value);

        return;
      }
      setIntent(prev =>
        prev[key] === value ? prev : { ...prev, [key]: value },
      );
      cfg?.onOpenChange?.(value);
    },
    [configRef],
  );

  const openModal = useCallback(
    (key: Keys) => setIntentForKey(key, true),
    [setIntentForKey],
  );

  const closeModal = useCallback(
    (key: Keys) => setIntentForKey(key, false),
    [setIntentForKey],
  );

  const toggleModal = useCallback(
    (key: Keys) => setIntentForKey(key, !resolvedRef.current[key]),
    [resolvedRef, setIntentForKey],
  );

  const closeAll = useCallback(() => {
    keys.forEach(key => setIntentForKey(key, false));
  }, [keys, setIntentForKey]);

  const isOpen = useCallback((key: Keys) => Boolean(visible[key]), [visible]);

  const modals = useMemo(
    () =>
      keys.reduce(
        (acc, key) => {
          acc[key] = {
            open: visible[key],
            onOpen: () => openModal(key),
            onClose: () => closeModal(key),
            onToggle: () => toggleModal(key),
          };

          return acc;
        },
        {} as Record<Keys, ModalState>,
      ),
    [keys, visible, openModal, closeModal, toggleModal],
  );

  return {
    modals,
    open: openModal,
    close: closeModal,
    toggle: toggleModal,
    closeAll,
    isOpen,
  };
};
