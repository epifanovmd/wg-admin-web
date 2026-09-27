import type { IWgNodeLive } from "@entities/wg";
import type { WgNodeDto } from "@shared/api/gen/main/model";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { NodeOverviewTab } from "../NodeOverviewTab";

const node = {
  id: "n1",
  osInfo: { distro: "Debian GNU/Linux 12 (bookworm)" },
} as unknown as WgNodeDto;

const live = {
  nodeId: "n1",
  rxBps: 0,
  txBps: 0,
  rxTotal: 0,
  txTotal: 0,
  peersOnline: 0,
  peersTotal: 0,
  ts: new Date().toISOString(),
  sys: {
    cpuPercent: 1,
    load1: 0,
    memUsedBytes: 1,
    memTotalBytes: 2,
    diskUsedBytes: 1,
    diskTotalBytes: 2,
    // 26 суток 21 час 59 минут — агент шлёт секунды.
    uptimeSec: 26 * 86_400 + 21 * 3_600 + 59 * 60,
  },
} as unknown as IWgNodeLive;

describe("NodeOverviewTab", () => {
  it("аптайм — из секунд агента, а не ×1000", () => {
    render(
      <NodeOverviewTab
        node={node}
        live={live}
        speedPoints={[]}
        metrics={[]}
        isMetricsLoading={false}
        links={[]}
      />,
    );

    expect(screen.getByText("26 д 21 ч")).toBeTruthy();
  });
});
