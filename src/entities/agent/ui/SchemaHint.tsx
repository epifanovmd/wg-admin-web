import { Badge, Collapse } from "@shared/ui";
import { FC } from "react";

import { type ISchemaHint, schemaHint } from "../lib/schema";
import { SchemaHintField } from "./SchemaHintField";

interface SchemaHintProps {
  /** JSON Schema значения из манифеста воркера. */
  schema: unknown;
  /** Что описывает схема: «схема», «тело запроса», «ответ». */
  label?: string;
  /** Текст, если схемы нет. */
  emptyText?: string;
}

const summaryOf = (hint: ISchemaHint): string =>
  [hint.type && `тип ${hint.type}`, hint.description]
    .filter(Boolean)
    .join(" · ");

/** Подсказка по схеме значения: поля, их типы и описания; схема целиком — по запросу. */
export const SchemaHint: FC<SchemaHintProps> = ({
  schema,
  label = "схема",
  emptyText = "Схемы значения воркер не объявил — подойдёт любой JSON.",
}) => {
  const hint = schemaHint(schema);

  if (!hint) {
    return <p className="text-xs text-muted-foreground">{emptyText}</p>;
  }

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-border p-3">
      <p className="flex flex-wrap items-center gap-2 text-sm">
        <Badge variant="secondary">{label}</Badge>
        <span className="text-muted-foreground">{summaryOf(hint)}</span>
      </p>
      {hint.fields.length > 0 && (
        <ul className="flex flex-col gap-1">
          {hint.fields.map(field => (
            <SchemaHintField key={field.path} field={field} />
          ))}
        </ul>
      )}
      <Collapse size="sm">
        <Collapse.Trigger>Схема целиком</Collapse.Trigger>
        <Collapse.Content>
          <pre className="max-h-64 overflow-auto rounded bg-muted p-2 text-xs">
            {JSON.stringify(schema, null, 2)}
          </pre>
        </Collapse.Content>
      </Collapse>
    </div>
  );
};
