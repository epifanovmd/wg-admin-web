import { describe, expect, it } from "vitest";

import { wgSocksFormSchema } from "../useWgSocksFormVM";

const base = {
  mode: "create" as const,
  name: "telegram",
  nodeId: "n1",
  listenPort: 8444,
  enabled: true,
};

describe("wgSocksFormSchema", () => {
  it("создание: достаточно названия, ноды и порта", () => {
    expect(wgSocksFormSchema.safeParse(base).success).toBe(true);
  });

  it("адрес для клиентов — IP или домен", () => {
    expect(
      wgSocksFormSchema.safeParse({ ...base, clientHost: "203.0.113.10" })
        .success,
    ).toBe(true);
    expect(
      wgSocksFormSchema.safeParse({ ...base, clientHost: "http://x" }).success,
    ).toBe(false);
  });
});
