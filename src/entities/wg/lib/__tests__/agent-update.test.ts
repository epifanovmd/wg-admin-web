import { describe, expect, it } from "vitest";

import { resolveAgentUpdate } from "../agent-update";

const release = { version: "2.1.0", hashes: { amd64: "new", arm64: "arm" } };
const node = (patch = {}) => ({
  agentVersion: "2.0.0",
  agentCodeHash: "old",
  osInfo: { arch: "amd64" },
  ...patch,
});

describe("resolveAgentUpdate", () => {
  it("бинарь ноды отличается от релиза её архитектуры — обновление", () => {
    expect(resolveAgentUpdate(node(), release)).toBe("available");
    expect(
      resolveAgentUpdate(
        node({ osInfo: { arch: "arm64" }, agentCodeHash: "arm" }),
        release,
      ),
    ).toBe("none");
  });

  it("версия агента не важна — сравнивается бинарь", () => {
    expect(resolveAgentUpdate(node({ agentVersion: "1.0.0" }), release)).toBe(
      "available",
    );
  });

  it("архитектура — только amd64 и arm64, как их сообщает агент", () => {
    expect(resolveAgentUpdate(node({ osInfo: { arch: "x64" } }), release)).toBe(
      "none",
    );
  });

  it("актуален, нет релиза, неизвестна архитектура или агент не отчитался", () => {
    expect(resolveAgentUpdate(node({ agentCodeHash: "new" }), release)).toBe(
      "none",
    );
    expect(resolveAgentUpdate(node(), { version: null, hashes: {} })).toBe(
      "none",
    );
    expect(resolveAgentUpdate(node(), null)).toBe("none");
    expect(resolveAgentUpdate(node({ osInfo: null }), release)).toBe("none");
    expect(resolveAgentUpdate(node({ agentVersion: null }), release)).toBe(
      "none",
    );
  });
});
