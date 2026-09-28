import { afterEach, describe, expect, it } from "vitest";

import { createInjectDecorator } from "../create-inject-decorator";

const randomUUID = crypto.randomUUID;

describe("createInjectDecorator", () => {
  afterEach(() => {
    Object.defineProperty(crypto, "randomUUID", {
      value: randomUUID,
      configurable: true,
    });
  });

  it("работает без crypto.randomUUID (страница по http — незащищённый контекст)", () => {
    Object.defineProperty(crypto, "randomUUID", {
      value: undefined,
      configurable: true,
    });

    const first = createInjectDecorator<object>("first");
    const second = createInjectDecorator<object>("second");

    expect(first.Tid).toBeTruthy();
    expect(first.Tid).not.toBe(second.Tid);
  });
});
