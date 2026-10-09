import type { IAgentReleaseDto } from "@shared/api/gen/main/model";
import { describe, expect, it } from "vitest";

import {
  agentReleaseMessage,
  agentUpdateTarget,
  workerUpdateTarget,
} from "../release";

const release: IAgentReleaseDto = {
  manifest: { version: "1.0.1", artifacts: [] },
  candidates: [
    {
      agentId: "a1",
      name: "example-node",
      online: true,
      current: "1.0.0",
      target: "1.0.1",
      os: "linux",
      arch: "amd64",
    },
  ],
  workerCandidates: [
    {
      agentId: "a1",
      agentName: "example-node",
      online: true,
      worker: "wg",
      current: "1.0.0",
      target: "1.1.0",
      os: "linux",
      arch: "amd64",
    },
  ],
};

describe("agent release", () => {
  it("агент — кандидат на обновление: новая версия", () => {
    expect(agentUpdateTarget(release, "a1")).toBe("1.0.1");
    expect(agentUpdateTarget(release, "a2")).toBeNull();
    expect(agentUpdateTarget(release, null)).toBeNull();
    expect(agentUpdateTarget(null, "a1")).toBeNull();
  });

  it("воркер — кандидат по агенту и имени", () => {
    expect(workerUpdateTarget(release, "a1", "wg")).toBe("1.1.0");
    expect(workerUpdateTarget(release, "a1", "socks")).toBeNull();
    expect(workerUpdateTarget(release, "a2", "wg")).toBeNull();
    expect(workerUpdateTarget(null, "a1", "wg")).toBeNull();
  });

  it("новая версия агента в источнике — уведомление; первое получение — без него", () => {
    expect(
      agentReleaseMessage({
        version: "1.2.0",
        previous: "1.1.0",
        from: "github:example/agent",
      }),
    ).toBe("Доступна версия агента 1.2.0 (была 1.1.0)");
    expect(
      agentReleaseMessage({ version: "1.1.0", from: "github:example/agent" }),
    ).toBeNull();
  });
});
