type NativeField = HTMLInputElement | HTMLTextAreaElement;

/**
 * Записывает value через сеттер прототипа: React отслеживает значение сам и
 * без этого не увидит изменение в следующем событии `input`.
 */
export const setNativeFieldValue = (field: NativeField, value: string) => {
  const setter = Object.getOwnPropertyDescriptor(
    Object.getPrototypeOf(field),
    "value",
  )?.set;

  if (setter) setter.call(field, value);
  else field.value = value;
};

/**
 * Очистка как пользовательский ввод: `onChange` получает событие (в том числе
 * у неуправляемого поля и в react-hook-form), фокус остаётся в поле.
 */
export const clearNativeField = (field: NativeField) => {
  setNativeFieldValue(field, "");
  field.dispatchEvent(new Event("input", { bubbles: true }));
  field.focus({ preventScroll: true });
};
