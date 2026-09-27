import { describe, expect, it } from "vitest";

import { macClientFileName, telegramSocksLink } from "../socks-links";

describe("wg-socks: ссылки и имена", () => {
  it("tg://socks на локальный stunnel, логин и пароль закодированы", () => {
    expect(
      telegramSocksLink({
        serviceName: "tg",
        username: "tg@user",
        password: "a b&c",
      }),
    ).toBe(
      "tg://socks?server=127.0.0.1&port=1080&user=tg%40user&pass=a%20b%26c",
    );
  });

  it("имя архива — как у бэкенда", () => {
    expect(macClientFileName("Telegram NL")).toBe("telegram-nl-mac.zip");
    expect(macClientFileName("Прокси")).toBe("proxy-mac.zip");
  });
});
