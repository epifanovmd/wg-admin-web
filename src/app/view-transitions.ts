const noop = () => {};

/**
 * Роутер запускает View Transition на каждую навигацию и не смотрит на её
 * промисы. Пропущенный переход — новая навигация раньше конца анимации или
 * скрытая вкладка — по спецификации отклоняет `ready`, хотя страница
 * обновилась. Гасим только это отклонение: ошибки самого обновления
 * (`updateCallbackDone`) по-прежнему всплывают.
 */
export const handleSkippedViewTransitions = (): void => {
  if (typeof document === "undefined" || !("startViewTransition" in document)) {
    return;
  }

  const start = document.startViewTransition.bind(document);

  document.startViewTransition = ((
    ...args: Parameters<typeof document.startViewTransition>
  ) => {
    const transition = start(...args);

    transition.ready.catch(noop);

    return transition;
  }) as typeof document.startViewTransition;
};
