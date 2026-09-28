import { TooltipProvider } from "@radix-ui/react-tooltip";
import type { WgInterfaceDto } from "@shared/api/gen/main/model";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { InterfaceStatusCompact } from "../InterfaceStatusCompact";

const iface = (patch: Partial<WgInterfaceDto> = {}) =>
  ({
    nodeId: "nl",
    nodeName: "Нидерланды",
    status: "up",
    statusMessage: null,
    enabled: true,
    replicas: [
      {
        nodeId: "kz",
        nodeName: "Алматы",
        nodeStatus: "created",
        priority: 1,
        status: "unknown",
        statusMessage: null,
      },
    ],
    endpoint: {
      name: "msk-relay",
      mode: "relay",
      relayNodeId: "msk",
      relayNodeName: "MSK",
    },
    servingNodeId: "nl",
    activeReplicaNodeId: null,
    ...patch,
  }) as unknown as WgInterfaceDto;

const renderCell = (value: WgInterfaceDto, hostNodeId?: string) =>
  render(
    <TooltipProvider>
      <InterfaceStatusCompact iface={value} hostNodeId={hostNodeId} />
    </TooltipProvider>,
  );

describe("InterfaceStatusCompact", () => {
  it("статус и число копий, подробности — в подсказке", () => {
    renderCell(iface());

    expect(screen.getByText("Up")).toBeTruthy();
    expect(screen.getByText("+1 копия")).toBeTruthy();
    expect(screen.queryByText("Ожидает агента")).toBeNull();
    expect(screen.queryByText(/трафик →/)).toBeNull();
  });

  it("релей перевёл трафик на копию — видно сразу", () => {
    renderCell(iface({ servingNodeId: "kz" }));

    expect(screen.getByText("трафик → Алматы")).toBeTruthy();
  });

  it("без копий — только статус", () => {
    renderCell(iface({ replicas: [] }));

    expect(screen.queryByText(/копи/)).toBeNull();
  });

  it("строка копии на её ноде — статус копии; трафик на ней — отметка", () => {
    renderCell(
      iface({
        replicas: [
          {
            nodeId: "kz",
            nodeName: "Алматы",
            nodeStatus: "online",
            priority: 1,
            status: "down",
            statusMessage: null,
          },
        ],
        servingNodeId: "kz",
      } as Partial<WgInterfaceDto>),
      "kz",
    );

    expect(screen.getByText("Down")).toBeTruthy();
    expect(screen.queryByText("Up")).toBeNull();
    expect(screen.getByText("трафик здесь")).toBeTruthy();
  });
});
