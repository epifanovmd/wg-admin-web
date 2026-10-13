import type { ISchemaFormField } from "@entities/agent";
import { InputFormField, SelectFormField, TextareaFormField } from "@shared/ui";
import { FC } from "react";

import type { TWorkerCommandForm } from "../model/validation";

interface WorkerArgsFieldsProps {
  fields: ISchemaFormField[];
}

const BOOLEAN_OPTIONS = [
  { value: "true", label: "да" },
  { value: "false", label: "нет" },
];

/** Подпись поля: имя, обязательность, пределы. */
const labelOf = (field: ISchemaFormField): string => {
  const limits = [
    field.minimum !== null && `от ${field.minimum}`,
    field.maximum !== null && `до ${field.maximum}`,
    field.maxLength !== null && `до ${field.maxLength} символов`,
  ].filter(Boolean);

  return `${field.name}${field.required ? " *" : ""}${limits.length ? ` (${limits.join(" ")})` : ""}`;
};

/** Аргументы команды формой по схеме: по полю на свойство. */
export const WorkerArgsFields: FC<WorkerArgsFieldsProps> = ({ fields }) => (
  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
    {fields.map(field => {
      const name = `fields.${field.name}` as const;
      const common = {
        name,
        label: labelOf(field),
        description: field.description ?? undefined,
      };

      switch (field.kind) {
        case "boolean":
          return (
            <SelectFormField<TWorkerCommandForm>
              key={field.name}
              {...common}
              options={BOOLEAN_OPTIONS}
              placeholder="не задано"
            />
          );
        case "enum":
          return (
            <SelectFormField<TWorkerCommandForm>
              key={field.name}
              {...common}
              options={field.options}
              placeholder="не задано"
            />
          );
        case "json":
          return (
            <TextareaFormField<TWorkerCommandForm>
              key={field.name}
              {...common}
              rows={3}
              className="font-mono text-xs"
              placeholder="JSON"
              fieldClassName="sm:col-span-2"
            />
          );
        default:
          return (
            <InputFormField<TWorkerCommandForm>
              key={field.name}
              {...common}
              inputMode={field.kind === "string" ? undefined : "decimal"}
              placeholder={field.kind === "string" ? "" : "число"}
            />
          );
      }
    })}
  </div>
);
