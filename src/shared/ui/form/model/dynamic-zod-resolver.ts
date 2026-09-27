import { zodResolver } from "@hookform/resolvers/zod";
import type { FieldValues, Resolver } from "react-hook-form";
import { z } from "zod";

type ShapeKey<TShape extends z.ZodRawShape> = Extract<keyof TShape, string>;

export type DynamicZodOmitMask<TShape extends z.ZodRawShape> = Partial<
  Record<ShapeKey<TShape>, boolean>
>;

type ConditionalKey<
  TShape extends z.ZodRawShape,
  TMask extends object,
> = Extract<keyof TMask, keyof z.output<z.ZodObject<TShape>>>;

export type DynamicZodOutput<
  TShape extends z.ZodRawShape,
  TMask extends object,
> = Omit<z.output<z.ZodObject<TShape>>, ConditionalKey<TShape, TMask>> &
  Partial<Pick<z.output<z.ZodObject<TShape>>, ConditionalKey<TShape, TMask>>>;

export type DynamicZodRefine<
  TShape extends z.ZodRawShape,
  TMask extends object,
> = (
  values: DynamicZodOutput<TShape, TMask>,
  context: z.RefinementCtx,
) => void | Promise<void>;

/**
 * Выбирает исключаемые поля по текущим значениям и валидирует итоговую схему.
 * Исключённые поля не проверяются и не попадают в результат resolver.
 *
 * Функция `omit` должна возвращать `true` для исключаемого поля. Все ключи,
 * которые присутствуют в возвращаемой маске, становятся optional в типе
 * `DynamicZodOutput`, потому что их наличие зависит от runtime-условия.
 * В самих submit-данных исключённый ключ отсутствует, а не равен `undefined`.
 *
 * При использовании с RHF необходимо передать output третьим generic-параметром
 * `useForm`. Если указать только input, submit ошибочно сохранит тип полной схемы.
 *
 * @example
 * const schema = z.object({
 *   customerType: z.enum(["person", "company"]),
 *   inn: z.string().regex(/^\d{10}$/),
 * });
 *
 * const getOmittedFields = (values: z.input<typeof schema>) => ({
 *   inn: values.customerType !== "company",
 * });
 *
 * type FormValues = z.input<typeof schema>;
 * type SubmitValues = DynamicZodOutput<
 *   typeof schema.shape,
 *   ReturnType<typeof getOmittedFields>
 * >;
 *
 * const form = useForm<FormValues, unknown, SubmitValues>({
 *   resolver: dynamicZodResolver(schema, getOmittedFields),
 *   shouldUnregister: true,
 * });
 *
 * form.handleSubmit(data => {
 *   data.inn; // string | undefined
 *   "inn" in data; // false, если поле было исключено
 * });
 *
 * Третий аргумент `refine` может быть синхронным или асинхронным. Resolver
 * дожидается Promise перед завершением валидации.
 *
 * Helper возвращает безопасный, но консервативный тип (`inn?: string`) и не
 * выводит связь вида «company => inn обязателен». Если требуется точный union
 * вариантов submit-данных, следует использовать `z.discriminatedUnion`.
 */
export const dynamicZodResolver = <
  TShape extends z.ZodRawShape,
  const TMask extends Record<string, boolean>,
>(
  schema: z.ZodObject<TShape>,
  omit: (
    values: z.input<z.ZodObject<TShape>>,
  ) => TMask & Record<Exclude<keyof TMask, ShapeKey<TShape>>, never>,
  refine?: DynamicZodRefine<TShape, TMask>,
): Resolver<
  z.input<typeof schema> & FieldValues,
  unknown,
  DynamicZodOutput<TShape, TMask> & FieldValues
> => {
  type DynamicResolver = Resolver<
    z.input<typeof schema> & FieldValues,
    unknown,
    DynamicZodOutput<TShape, TMask> & FieldValues
  >;

  const cache = new Map<string, DynamicResolver>();

  return async (values, context, options) => {
    const flags = omit(values);
    const omittedKeys = Object.entries(flags)
      .filter(
        ([key, shouldOmit]) =>
          shouldOmit === true && Object.hasOwn(schema.shape, key),
      )
      .map(([key]) => key)
      .sort();
    const cacheKey = omittedKeys.join("\0");
    let resolver = cache.get(cacheKey);

    if (!resolver) {
      const mask = Object.fromEntries(
        omittedKeys.map(key => [key, true] as const),
      );
      const selectedSchema = schema.omit(mask as never);
      const validatedSchema = refine
        ? selectedSchema.superRefine(async (data, refinementContext) => {
            await refine(
              data as DynamicZodOutput<TShape, TMask>,
              refinementContext,
            );
          })
        : selectedSchema;

      resolver = zodResolver(validatedSchema) as DynamicResolver;
      cache.set(cacheKey, resolver);
    }

    return resolver(values, context, options);
  };
};
