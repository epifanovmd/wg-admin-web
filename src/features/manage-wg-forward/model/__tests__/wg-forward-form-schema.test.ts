import { describe, expect, it } from "vitest";

import { wgForwardFormSchema } from "../useWgForwardFormVM";

const base = {
  name: "wg-server",
  relayNodeId: "r1",
  protocol: "udp" as const,
  listenPort: 51820,
  targetPort: 51820,
  route: "auto" as const,
  enabled: true,
};

describe("wgForwardFormSchema", () => {
  it("через туннель — только до ноды; напрямую — достаточно адреса", () => {
    expect(
      wgForwardFormSchema.safeParse({
        ...base,
        path: "ipip",
        targetHost: "198.51.100.20",
      }).success,
    ).toBe(false);
    expect(
      wgForwardFormSchema.safeParse({
        ...base,
        path: "direct",
        targetHost: "198.51.100.20",
      }).success,
    ).toBe(true);
    expect(
      wgForwardFormSchema.safeParse({ ...base, path: "direct" }).success,
    ).toBe(false);
  });
});
