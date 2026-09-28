import { describe, expect, it } from "vitest";

import { nodeSyncView } from "../status";

const node = (patch = {}) => ({
  status: "online" as const,
  inSync: true,
  applyError: null,
  ...patch,
});

describe("nodeSyncView", () => {
  it("агента ещё нет — «Ожидает агента», а не вечное «Применяется»", () => {
    for (const status of ["created", "provisioning"] as const) {
      expect(nodeSyncView(node({ status, inSync: false }))).toMatchObject({
        label: "Ожидает агента",
        variant: "muted",
      });
    }
  });

  it("нода недоступна и конфигурация не применена — «Не применена» с причиной", () => {
    for (const status of ["offline", "error"] as const) {
      const view = nodeSyncView(node({ status, inSync: false }));

      expect(view).toMatchObject({ label: "Не применена", variant: "muted" });
      expect(view.hint).toContain("недоступна");
    }
  });

  it("ошибка применения — с текстом ошибки", () => {
    expect(
      nodeSyncView(node({ inSync: false, applyError: "wg-quick: boom" })),
    ).toEqual({
      label: "Ошибка применения",
      variant: "destructive",
      hint: "wg-quick: boom",
    });
  });

  it("online: актуальна или применяется", () => {
    expect(nodeSyncView(node())).toMatchObject({
      label: "Актуальна",
      variant: "success",
    });
    expect(nodeSyncView(node({ inSync: false }))).toMatchObject({
      label: "Применяется…",
      variant: "warning",
    });
    expect(nodeSyncView(node({ status: "offline" }))).toMatchObject({
      label: "Актуальна",
    });
  });
});
