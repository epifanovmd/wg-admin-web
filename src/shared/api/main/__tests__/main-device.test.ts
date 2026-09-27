import { describe, expect, it } from "vitest";

import { deviceHeaders } from "../main-device";

describe("deviceHeaders", () => {
  it("браузер и ОС из User-Agent, тип — web", () => {
    expect(
      deviceHeaders(
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0 Safari/537.36",
      ),
    ).toEqual({ "X-Device-Name": "Chrome, Mac OS X", "X-Device-Type": "web" });
  });

  it("не-ASCII в значении заголовка не попадает", () => {
    expect(deviceHeaders("Браузер/1")["X-Device-Name"]).toBe("/1");
  });
});
