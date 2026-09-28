import { describe, expect, it } from "vitest";

import { formatVersionLines } from "../versions";

const api = {
  version: "v1.2.0",
  commit: "abc1234",
  builtAt: "2026-09-28T20:00:00Z",
  startedAt: "2026-09-28T20:05:00Z",
  agentVersion: "2.2.2",
};

describe("formatVersionLines", () => {
  it("веб, API и агент: тег с коммитом, время сборки — в подсказке", () => {
    expect(
      formatVersionLines(
        { version: "v1.0.0", commit: "def5678", builtAt: null },
        api,
      ),
    ).toEqual([
      { label: "Веб", value: "v1.0.0 · def5678", hint: undefined },
      {
        label: "API",
        value: "v1.2.0 · abc1234",
        hint: "Собрано 2026-09-28T20:00:00Z",
      },
      { label: "Агент", value: "v2.2.2" },
    ]);
  });

  it("версия без тега — сам SHA: коммит не дублируется", () => {
    const [, apiLine] = formatVersionLines(
      { version: "1.0.0", commit: null, builtAt: null },
      { ...api, version: "abc1234-dirty" },
    );

    expect(apiLine.value).toBe("abc1234-dirty");
  });

  it("агент не собран на бэкенде", () => {
    const lines = formatVersionLines(
      { version: "1.0.0", commit: null, builtAt: null },
      { ...api, agentVersion: null },
    );

    expect(lines.at(-1)).toEqual({ label: "Агент", value: "не собран" });
  });

  it("версия API ещё не загружена — только веб", () => {
    expect(
      formatVersionLines(
        { version: "1.0.0", commit: null, builtAt: null },
        null,
      ),
    ).toEqual([{ label: "Веб", value: "1.0.0", hint: undefined }]);
  });
});
