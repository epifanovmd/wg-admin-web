import type { IWgMeshCell } from "@shared/api/gen/main/model";
import { describe, expect, it } from "vitest";

import { describeMeshCell, isMeshCellStale, MESH_STALE_MS } from "../mesh-cell";

const ts = "2026-10-04T12:00:00.000Z";
const now = Date.parse(ts) + 30_000;

const cell = (overrides: Partial<IWgMeshCell> = {}): IWgMeshCell => ({
  fromNodeId: "a",
  toNodeId: "b",
  rttMs: 48,
  lossPercent: 6.7,
  samples: 5,
  ts,
  ...overrides,
});

describe("isMeshCellStale", () => {
  it("свежая, пока проба моложе порога", () => {
    expect(isMeshCellStale(ts, Date.parse(ts) + MESH_STALE_MS)).toBe(false);
  });

  it("устаревшая, когда проб нет дольше порога", () => {
    expect(isMeshCellStale(ts, Date.parse(ts) + MESH_STALE_MS + 1)).toBe(true);
  });
});

describe("describeMeshCell", () => {
  it("потери — среднее за пробы окна", () => {
    expect(describeMeshCell(cell(), now)).toBe("Потери 6.7% · 5 проб");
  });

  it("последняя проба без ответа", () => {
    expect(describeMeshCell(cell({ rttMs: null, lossPercent: 100 }), now)).toBe(
      "Не отвечает (или ICMP закрыт) · потери 100% · 5 проб",
    );
  });

  it("устаревшая — с пометкой", () => {
    expect(
      describeMeshCell(
        cell({ samples: 1 }),
        Date.parse(ts) + MESH_STALE_MS + 1,
      ),
    ).toBe("Нет свежих данных · потери 6.7% · 1 проба");
  });
});
