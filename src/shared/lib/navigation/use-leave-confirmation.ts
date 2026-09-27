import { useLatestRef } from "@shared/lib/hooks";
import { type ModalConfirmOptions, useConfirm } from "@shared/ui";
import { type ShouldBlockFn, useBlocker } from "@tanstack/react-router";
import { useCallback, useEffect, useRef } from "react";

/** Переход, который охрана решает пропустить или задержать. */
export type LeaveTransition = Parameters<ShouldBlockFn>[0];

export type LeaveConfirmDialog = Pick<
  ModalConfirmOptions,
  "title" | "description" | "confirmLabel" | "cancelLabel" | "confirmVariant"
>;

export interface UseLeaveConfirmationOptions {
  /**
   * Есть что терять. Функция читается в момент перехода — удобно для
   * MobX-сторов, флаг которых меняется без ререндера.
   */
  when: boolean | (() => boolean);
  /** Тексты стандартного окна подтверждения. */
  dialog?: LeaveConfirmDialog;
  /** Своё подтверждение вместо окна: `true` — уйти. */
  confirm?: (transition: LeaveTransition) => boolean | Promise<boolean>;
  /**
   * Действие после согласия уйти (например, сохранить): `false` — остаться,
   * если сохранить не удалось.
   */
  onConfirm?: () => boolean | void | Promise<boolean | void>;
  /** Какие переходы охранять; по умолчанию — любые со сменой страницы. */
  shouldBlock?: (transition: LeaveTransition) => boolean;
  /** Охранять и смену search/hash на той же странице. */
  blockSamePath?: boolean;
  /** Нативный диалог браузера при закрытии и перезагрузке вкладки. */
  beforeUnload?: boolean;
  disabled?: boolean;
}

export interface LeaveConfirmation {
  /** Выполняет действие (обычно переход) без подтверждения ухода. */
  withoutConfirmation: <T>(action: () => T | Promise<T>) => Promise<T>;
}

const DEFAULT_DIALOG: LeaveConfirmDialog = {
  title: "Уйти со страницы?",
  description: "Несохранённые изменения пропадут.",
  confirmLabel: "Уйти",
  cancelLabel: "Остаться",
  confirmVariant: "destructive",
};

const resolveWhen = (when: UseLeaveConfirmationOptions["when"]) =>
  typeof when === "function" ? when() : when;

const isSamePath = ({ current, next }: LeaveTransition) =>
  current.pathname === next.pathname;

/**
 * Подтверждение ухода со страницы с несохранёнными изменениями: любой
 * переход роутера (ссылки, `navigate`, «назад» браузера) и закрытие вкладки.
 * Пока открыт диалог, повторные переходы задерживаются без второго окна.
 *
 * @example
 * useLeaveConfirmation({
 *   when: () => store.isDirty,
 *   dialog: { title: "Правки не сохранены", confirmLabel: "Сохранить и перейти" },
 *   onConfirm: save,
 * });
 */
export const useLeaveConfirmation = (
  options: UseLeaveConfirmationOptions,
): LeaveConfirmation => {
  const optionsRef = useLatestRef(options);
  const confirmModal = useConfirm();
  const pendingRef = useRef(false);
  const bypassRef = useRef(false);

  const isGuarded = useCallback(() => {
    const { when, disabled } = optionsRef.current;

    return !disabled && !bypassRef.current && resolveWhen(when);
  }, [optionsRef]);

  const askToLeave = useCallback(
    async (transition: LeaveTransition) => {
      const { confirm, dialog, onConfirm } = optionsRef.current;
      const leave = confirm
        ? await confirm(transition)
        : await confirmModal({ ...DEFAULT_DIALOG, ...dialog });

      if (!leave) return false;

      return (await onConfirm?.()) !== false;
    },
    [optionsRef, confirmModal],
  );

  const shouldBlockFn = useCallback<ShouldBlockFn>(
    async transition => {
      const { shouldBlock, blockSamePath } = optionsRef.current;

      if (!isGuarded()) return false;
      if (!blockSamePath && isSamePath(transition)) return false;
      if (shouldBlock && !shouldBlock(transition)) return false;
      if (pendingRef.current) return true;

      pendingRef.current = true;

      try {
        return !(await askToLeave(transition));
      } finally {
        pendingRef.current = false;
      }
    },
    [optionsRef, isGuarded, askToLeave],
  );

  useBlocker({
    shouldBlockFn,
    // Закрытие вкладки обрабатываем сами: роутер вешает его только на
    // browser history, а условие должно читаться в момент события.
    enableBeforeUnload: false,
    disabled: options.disabled || options.when === false,
  });

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (optionsRef.current.beforeUnload === false || !isGuarded()) return;

      event.preventDefault();
      // Старые браузеры показывают диалог только при непустом returnValue.
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [optionsRef, isGuarded]);

  const withoutConfirmation = useCallback(
    async <T>(action: () => T | Promise<T>): Promise<T> => {
      bypassRef.current = true;

      try {
        return await action();
      } finally {
        bypassRef.current = false;
      }
    },
    [],
  );

  return { withoutConfirmation };
};
