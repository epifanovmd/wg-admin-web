import { describe, expect, it } from "vitest";

import { wgInterfaceFormSchema } from "../useWgInterfaceFormVM";

const base = {
  name: "wg0",
  listenPort: 51820,
  addressCidr: "10.0.0.1/24",
  natEnabled: true,
};

describe("wgInterfaceFormSchema", () => {
  it("очищенные поля MTU и порта на точке (null) — допустимы: «как по умолчанию»", () => {
    // Числовое поле при очистке отдаёт null — форма не должна падать.
    expect(
      wgInterfaceFormSchema.safeParse({
        ...base,
        endpointId: "e1",
        endpointPort: null,
        mtu: null,
      }).success,
    ).toBe(true);
  });

  it("порт на точке вне диапазона — понятная ошибка", () => {
    const result = wgInterfaceFormSchema.safeParse({
      ...base,
      endpointPort: 70000,
    });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe("Порт — от 1 до 65535.");
  });
});
