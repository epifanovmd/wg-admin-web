import { describe, expect, it } from "vitest";

import { agentErrorText } from "../errors";
import {
  schemaFormBody,
  schemaFormDefaults,
  schemaFormFields,
} from "../schema-form";

const echo = {
  type: "object",
  required: ["text"],
  properties: {
    text: { type: "string", maxLength: 5, description: "Текст" },
    repeat: { type: "integer", minimum: 1, maximum: 10, default: 2 },
    ratio: { type: ["number", "null"] },
    case: { type: "string", enum: ["upper", "lower"] },
    reverse: { type: "boolean" },
    data: {},
  },
  additionalProperties: false,
};

describe("schema form", () => {
  it("поля по свойствам: простые — своими видами, остальное — JSON", () => {
    const fields = schemaFormFields(echo)!;

    expect(fields.map(f => [f.name, f.kind, f.required])).toEqual([
      ["text", "string", true],
      ["repeat", "integer", false],
      ["ratio", "number", false],
      ["case", "enum", false],
      ["reverse", "boolean", false],
      ["data", "json", false],
    ]);
    expect(fields[0]).toMatchObject({ description: "Текст", maxLength: 5 });
    expect(fields[1]).toMatchObject({ minimum: 1, maximum: 10 });
    expect(fields[3].options).toEqual([
      { value: '"upper"', label: "upper" },
      { value: '"lower"', label: "lower" },
    ]);
  });

  it("не объект со свойствами — формы нет", () => {
    expect(schemaFormFields(undefined)).toBeNull();
    expect(schemaFormFields({ type: "array" })).toBeNull();
    expect(schemaFormFields({ type: "object" })).toBeNull();
    expect(schemaFormFields({ type: "object", properties: {} })).toBeNull();
  });

  it("начальные значения — default свойств", () => {
    const fields = schemaFormFields(echo)!;

    expect(schemaFormDefaults(echo, fields)).toMatchObject({
      text: "",
      repeat: "2",
      reverse: "",
    });
  });

  it("тело: значения по видам, пустые необязательные пропускаются", () => {
    const fields = schemaFormFields(echo)!;

    expect(
      schemaFormBody(fields, {
        text: "аб",
        repeat: "3",
        ratio: "0,5",
        case: '"lower"',
        reverse: "true",
        data: '{"a":1}',
      }),
    ).toEqual({
      value: {
        text: "аб",
        repeat: 3,
        ratio: 0.5,
        case: "lower",
        reverse: true,
        data: { a: 1 },
      },
    });
    expect(schemaFormBody(fields, { text: "x", reverse: "false" })).toEqual({
      value: { text: "x", reverse: false },
    });
  });

  it("ошибки — по полям: обязательное, длина, целое, пределы, JSON", () => {
    const fields = schemaFormFields(echo)!;

    expect(
      schemaFormBody(fields, { text: "", repeat: "1.5", data: "{" }),
    ).toEqual({
      errors: {
        text: "Обязательное поле.",
        repeat: "Нужно целое число.",
        data: "Неверный JSON.",
      },
    });
    expect(
      schemaFormBody(fields, { text: "длинный", repeat: "11", ratio: "x" }),
    ).toEqual({
      errors: {
        text: "Не длиннее 5 символов.",
        repeat: "Не больше 10.",
        ratio: "Нужно число.",
      },
    });
    expect(schemaFormBody(fields, { text: "a", repeat: "0" })).toEqual({
      errors: { repeat: "Не меньше 1." },
    });
  });
});

describe("agentErrorText", () => {
  it("ошибки по манифесту — с префиксом AGENT_ и без; другие — null", () => {
    expect(agentErrorText("AGENT_COMMAND_UNDECLARED")?.title).toBe(
      "Команда не объявлена",
    );
    expect(agentErrorText("TIMEOUT")?.title).toBe("Срок вышел");
    expect(agentErrorText("AGENT_COMMAND_INVALID")?.hint).toContain("схему");
    expect(agentErrorText("AGENT_OFFLINE")).toBeNull();
    expect(agentErrorText(null)).toBeNull();
  });
});
