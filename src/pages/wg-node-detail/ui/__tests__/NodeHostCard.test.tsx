import type { WgNodeDto } from "@shared/api/gen/main/model";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { NodeHostCard } from "../NodeHostCard";

const node = {
  id: "n1",
  publicHost: "192.0.2.30",
  agentRemoteIp: "192.0.2.30",
  osInfo: { wgMode: "kernel", udpPorts: [53, 51820] },
} as unknown as WgNodeDto;

const sys = {
  cpuPercent: 10,
  load1: 0.5,
  load5: 0.4,
  load15: 0.3,
  memUsedBytes: 1,
  memTotalBytes: 2,
  diskUsedBytes: 1,
  diskTotalBytes: 2,
  uptimeSec: 60,
  nics: [{ name: "eth0", rxBps: 2048, txBps: 1024 }],
  conntrackCount: 120,
  conntrackMax: 262144,
};

describe("NodeHostCard", () => {
  it("показывает режим WG, load, conntrack, сетевые интерфейсы и порты", () => {
    render(<NodeHostCard node={node} sys={sys} />);

    expect(screen.getByText("Модуль ядра")).toBeTruthy();
    expect(screen.getByText("0.50 / 0.40 / 0.30")).toBeTruthy();
    expect(screen.getByText("120 / 262144")).toBeTruthy();
    expect(screen.getByText("eth0")).toBeTruthy();
    expect(screen.getByText("51820")).toBeTruthy();
    expect(screen.queryByText(/не совпадает/)).toBeNull();
  });

  it("wireguard-go — предупреждение; IP агента не совпадает с publicHost — подсказка", () => {
    render(
      <NodeHostCard
        node={
          {
            ...node,
            agentRemoteIp: "10.0.0.5",
            osInfo: { wgMode: "userspace" },
          } as WgNodeDto
        }
        sys={null}
      />,
    );

    expect(screen.getByText("wireguard-go")).toBeTruthy();
    expect(screen.getByText(/пространстве пользователя/)).toBeTruthy();
    expect(screen.getByText(/не совпадает/)).toBeTruthy();
  });
});
