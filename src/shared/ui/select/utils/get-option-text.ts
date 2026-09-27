import type { SelectOption, SelectValue } from "../types";

/** Текстовая форма опции: строковый `label`, иначе `textLabel`, иначе `value`. */
export const getOptionText = <V extends SelectValue>(
  option: SelectOption<V>,
): string => {
  if (typeof option.label === "string") return option.label;
  if (typeof option.label === "number") return String(option.label);

  return option.textLabel ?? String(option.value);
};
