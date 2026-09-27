import { zodResolver } from "@hookform/resolvers/zod";
import {
  type FieldValues,
  useForm,
  type UseFormProps,
  type UseFormReturn,
} from "react-hook-form";
import { z } from "zod";

/**
 * Создаёт форму RHF с Zod-резолвером, сохраняя разные input/output типы схемы.
 * По умолчанию ошибки — после попытки отправить, дальше перепроверка на
 * change: уход фокуса с пустого (или автозаполненного браузером — значение
 * видно скрипту только после действия пользователя) поля не ругается.
 * Остальные опции RHF (включая `shouldFocusError`) — со своими значениями.
 *
 * @example
 * const form = useZodForm(schema, { defaultValues: { name: "" } });
 */
export const useZodForm = <
  TInput extends FieldValues,
  TOutput extends FieldValues,
>(
  schema: z.ZodType<TOutput, TInput>,
  options: Omit<UseFormProps<TInput, unknown, TOutput>, "resolver"> = {},
): UseFormReturn<TInput, unknown, TOutput> =>
  useForm<TInput, unknown, TOutput>({
    mode: "onSubmit",
    reValidateMode: "onChange",
    ...options,
    resolver: zodResolver(schema),
  });
