import { describe, expect, it } from "vitest";

import { enrollmentTokenState } from "../useEnrollAgentVM";
import {
  enrollmentTokenSchema,
  INSTALL_DEFAULTS,
  installCommandSchema,
  parsePairs,
  tokenExpiresAt,
} from "../validation";

describe("enroll-agent validation", () => {
  it("пары ключ=значение: запятые и строки, ключ без значения", () => {
    expect(parsePairs("zone=eu, gpu\nrack = 4")).toEqual({
      pairs: { zone: "eu", gpu: "", rack: "4" },
    });
    expect(parsePairs("bad pair")).toEqual({ error: "bad pair" });
  });

  it("срок токена: бессрочный — без даты", () => {
    expect(tokenExpiresAt("never")).toBeUndefined();
    expect(tokenExpiresAt("1h", 0)).toBe(new Date(3_600_000).toISOString());
  });

  it("метки токена превращаются в объект, пустые — нет", () => {
    const parsed = enrollmentTokenSchema.parse({
      name: "eu",
      expiry: "1d",
      singleUse: true,
      labels: "zone=eu",
    });

    expect(parsed.labels).toEqual({ zone: "eu" });
    expect(
      enrollmentTokenSchema.parse({ ...parsed, labels: "" }).labels,
    ).toBeUndefined();
    expect(
      enrollmentTokenSchema.safeParse({ ...parsed, labels: "a b" }).success,
    ).toBe(false);
  });

  it("команда установки: ровно одно из токена и файла с токеном", () => {
    expect(installCommandSchema.safeParse(INSTALL_DEFAULTS).success).toBe(
      false,
    );
    expect(
      installCommandSchema.safeParse({
        ...INSTALL_DEFAULTS,
        token: "p.s",
        tokenFile: "/etc/token",
      }).success,
    ).toBe(false);

    expect(
      installCommandSchema.parse({ ...INSTALL_DEFAULTS, token: "p.s" }),
    ).toEqual({ token: "p.s", tokenFile: undefined, baseUrl: undefined });
  });

  it("способ установки: служба не передаётся, без root и без установки — передаются", () => {
    const parse = (patch: Partial<typeof INSTALL_DEFAULTS>) =>
      installCommandSchema.parse({ ...INSTALL_DEFAULTS, token: "t", ...patch });

    expect(parse({}).mode).toBeUndefined();
    expect(parse({ mode: "rootless" }).mode).toBe("rootless");
    expect(parse({ mode: "run" }).mode).toBe("run");
  });

  it("неверный адрес сервера", () => {
    const result = installCommandSchema.safeParse({
      ...INSTALL_DEFAULTS,
      token: "p.s",
      baseUrl: "not a url",
    });

    expect(result.success).toBe(false);
    expect(result.error?.issues.map(i => i.path[0])).toEqual(["baseUrl"]);
  });

  it("состояние токена", () => {
    const token = {
      revokedAt: undefined,
      expiresAt: undefined,
      maxUses: 1,
      uses: 0,
    } as unknown as Parameters<typeof enrollmentTokenState>[0];

    expect(enrollmentTokenState(token)).toBe("active");
    expect(enrollmentTokenState({ ...token, uses: 1 })).toBe("used");
    expect(
      enrollmentTokenState({ ...token, expiresAt: "2000-01-01T00:00:00Z" }),
    ).toBe("expired");
    expect(
      enrollmentTokenState({ ...token, revokedAt: "2000-01-01T00:00:00Z" }),
    ).toBe("revoked");
  });
});
