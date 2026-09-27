type Handler<Args extends unknown[]> = (...args: Args) => void;

/**
 * Один обработчик, вызывающий RHF-колбэк и пользовательские по очереди.
 * Сигнатура выводится из пользовательских обработчиков: RHF-колбэки
 * (`field.onChange`, `field.onBlur`) принимают любые аргументы.
 */
export const composeHandlers =
  <Args extends unknown[]>(
    fieldHandler: NoInfer<Handler<Args>> | undefined,
    ...handlers: (Handler<Args> | undefined)[]
  ): Handler<Args> =>
  (...args) => {
    fieldHandler?.(...args);
    handlers.forEach(handler => handler?.(...args));
  };
