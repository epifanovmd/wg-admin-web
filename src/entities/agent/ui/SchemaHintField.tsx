import { FC } from "react";

import type { ISchemaField } from "../lib/schema";

interface SchemaHintFieldProps {
  field: ISchemaField;
}

/** Поле схемы: путь, тип, обязательность, допустимые значения, описание. */
export const SchemaHintField: FC<SchemaHintFieldProps> = ({ field }) => (
  <li className="text-xs">
    <span className="font-mono font-medium">{field.path}</span>
    {field.type && (
      <span className="text-muted-foreground"> · {field.type}</span>
    )}
    {field.required && <span className="text-warning"> · обязательно</span>}
    {field.options.length > 0 && (
      <span className="text-muted-foreground">
        {" "}
        · {field.options.join(" | ")}
      </span>
    )}
    {field.description && (
      <span className="block text-muted-foreground">{field.description}</span>
    )}
  </li>
);
