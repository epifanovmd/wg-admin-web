import { describe, expect, it } from "vitest";

import { schemaHint, schemaSkeleton } from "../schema";

const schema = {
  type: "object",
  description: "Настройки эха",
  required: ["prefix"],
  properties: {
    prefix: { type: "string", description: "Что добавить в начало" },
    case: { enum: ["upper", "lower"] },
    limits: {
      type: "object",
      properties: { steps: { type: "integer", default: 3 } },
    },
    tags: { type: "array", items: { type: "string" } },
  },
};

describe("schema hint", () => {
  it("поля схемы: тип, обязательность, варианты, вложенные — через точку", () => {
    expect(schemaHint(schema)).toEqual({
      type: "object",
      description: "Настройки эха",
      fields: [
        {
          path: "prefix",
          type: "string",
          description: "Что добавить в начало",
          required: true,
          options: [],
        },
        {
          path: "case",
          type: "enum",
          description: null,
          required: false,
          options: ['"upper"', '"lower"'],
        },
        {
          path: "limits",
          type: "object",
          description: null,
          required: false,
          options: [],
        },
        {
          path: "limits.steps",
          type: "integer",
          description: null,
          required: false,
          options: [],
        },
        {
          path: "tags",
          type: "string[]",
          description: null,
          required: false,
          options: [],
        },
      ],
    });
  });

  it("нет схемы — нет подсказки", () => {
    expect(schemaHint(undefined)).toBeNull();
    expect(schemaHint("string")).toBeNull();
  });

  it("заготовка: обязательные поля, иначе все; default и enum", () => {
    expect(schemaSkeleton(schema)).toEqual({ prefix: "" });
    expect(schemaSkeleton({ ...schema, required: [] })).toEqual({
      prefix: "",
      case: "upper",
      limits: { steps: 3 },
      tags: [],
    });
    expect(schemaSkeleton({ type: "boolean" })).toBe(false);
    expect(schemaSkeleton(undefined)).toEqual({});
  });
});
