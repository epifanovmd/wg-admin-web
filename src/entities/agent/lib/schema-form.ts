/** Вид поля формы по JSON Schema свойства. */
export type TSchemaFieldKind =
  "string" | "number" | "integer" | "boolean" | "enum" | "json";

/** Поле формы, построенной по JSON Schema объекта. */
export interface ISchemaFormField {
  /** Имя свойства. */
  name: string;
  kind: TSchemaFieldKind;
  required: boolean;
  description: string | null;
  /** Варианты `enum`: значение — JSON варианта, подпись — сам вариант. */
  options: { value: string; label: string }[];
  minimum: number | null;
  maximum: number | null;
  maxLength: number | null;
}

/** Значения формы — строки: число, `true`/`false`, JSON варианта или JSON. */
export type TSchemaFormValues = Record<string, string | null | undefined>;

type TSchema = Record<string, unknown>;

const isRecord = (value: unknown): value is TSchema =>
  !!value && typeof value === "object" && !Array.isArray(value);

const numberOf = (value: unknown): number | null =>
  typeof value === "number" && Number.isFinite(value) ? value : null;

const textOf = (value: unknown): string | null =>
  typeof value === "string" && value.trim() ? value : null;

/** Тип свойства: строка, а у `["string", "null"]` — первый не `null`. */
const typeOf = (schema: TSchema): string | null => {
  if (typeof schema.type === "string") return schema.type;
  if (Array.isArray(schema.type)) {
    const types = schema.type.filter(
      t => typeof t === "string" && t !== "null",
    );

    return types.length === 1 ? (types[0] as string) : null;
  }

  return null;
};

const kindOf = (schema: TSchema): TSchemaFieldKind => {
  if (Array.isArray(schema.enum) && schema.enum.length > 0) return "enum";

  const type = typeOf(schema);

  return type === "string" ||
    type === "number" ||
    type === "integer" ||
    type === "boolean"
    ? type
    : "json";
};

/**
 * Поля формы по схеме объекта: по свойству на поле; простые (строка, число,
 * да/нет, вариант из `enum`) — своими полями, остальные — JSON. Схема не
 * объект со свойствами — `null` (тело — JSON-редактором целиком).
 */
export const schemaFormFields = (
  schema: unknown,
): ISchemaFormField[] | null => {
  if (!isRecord(schema) || !isRecord(schema.properties)) return null;
  if (schema.type !== undefined && schema.type !== "object") return null;

  const required = new Set(
    Array.isArray(schema.required)
      ? schema.required.filter(name => typeof name === "string")
      : [],
  );
  const fields = Object.entries(schema.properties).map(
    ([name, raw]): ISchemaFormField => {
      const property = isRecord(raw) ? raw : {};
      const kind = kindOf(property);

      return {
        name,
        kind,
        required: required.has(name),
        description: textOf(property.description) ?? textOf(property.title),
        options:
          kind === "enum"
            ? (property.enum as unknown[]).map(option => ({
                value: JSON.stringify(option),
                label:
                  typeof option === "string" ? option : JSON.stringify(option),
              }))
            : [],
        minimum: numberOf(property.minimum),
        maximum: numberOf(property.maximum),
        maxLength: numberOf(property.maxLength),
      };
    },
  );

  return fields.length > 0 ? fields : null;
};

/** Начальные значения формы: `default` свойства, иначе пусто. */
export const schemaFormDefaults = (
  schema: unknown,
  fields: ISchemaFormField[],
): TSchemaFormValues => {
  const properties =
    isRecord(schema) && isRecord(schema.properties) ? schema.properties : {};

  return Object.fromEntries(
    fields.map(field => {
      const property = properties[field.name];
      const fallback = isRecord(property) ? property.default : undefined;

      if (fallback === undefined) return [field.name, ""];
      if (field.kind === "string") return [field.name, String(fallback)];
      if (field.kind === "json")
        return [field.name, JSON.stringify(fallback, null, 2)];

      return [field.name, JSON.stringify(fallback)];
    }),
  );
};

type TParsed = { value: unknown } | { error: string } | { skip: true };

const parseField = (field: ISchemaFormField, raw: string): TParsed => {
  const text = field.kind === "string" ? raw : raw.trim();

  if (text === "") {
    return field.required ? { error: "Обязательное поле." } : { skip: true };
  }

  switch (field.kind) {
    case "string":
      return field.maxLength !== null && text.length > field.maxLength
        ? { error: `Не длиннее ${field.maxLength} символов.` }
        : { value: text };
    case "number":
    case "integer": {
      const value = Number(text.replace(",", "."));

      if (!Number.isFinite(value)) return { error: "Нужно число." };
      if (field.kind === "integer" && !Number.isInteger(value))
        return { error: "Нужно целое число." };
      if (field.minimum !== null && value < field.minimum)
        return { error: `Не меньше ${field.minimum}.` };
      if (field.maximum !== null && value > field.maximum)
        return { error: `Не больше ${field.maximum}.` };

      return { value };
    }
    case "boolean":
      return { value: text === "true" };
    default:
      try {
        return { value: JSON.parse(text) };
      } catch {
        return { error: "Неверный JSON." };
      }
  }
};

/**
 * Тело по значениям формы: незаполненные необязательные поля пропускаются.
 * Ошибки — по именам полей.
 */
export const schemaFormBody = (
  fields: ISchemaFormField[],
  values: TSchemaFormValues,
): { value: Record<string, unknown> } | { errors: Record<string, string> } => {
  const value: Record<string, unknown> = {};
  const errors: Record<string, string> = {};

  for (const field of fields) {
    const parsed = parseField(field, values[field.name] ?? "");

    if ("error" in parsed) errors[field.name] = parsed.error;
    else if ("value" in parsed) value[field.name] = parsed.value;
  }

  return Object.keys(errors).length > 0 ? { errors } : { value };
};
