import { TooltipProvider } from "@radix-ui/react-tooltip";
import type { WgInterfaceDto } from "@shared/api/gen/main/model";
import { fireEvent, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

import { InterfaceReplicasCell } from "../InterfaceReplicasCell";
import { InterfaceTrafficNote } from "../InterfaceTrafficNote";

vi.mock("@tanstack/react-router", () => ({
  Link: ({
    children,
    params,
  }: {
    children: ReactNode;
    params: { nodeId: string };
  }) => <a href={`/wg/nodes/${params.nodeId}`}>{children}</a>,
}));

const iface = {
  id: "i1",
  nodeId: "a",
  nodeName: "Альфа",
  status: "up",
  statusMessage: null,
  enabled: true,
  endpointId: "e1",
  activeReplicaNodeId: null,
  servingNodeId: "d",
  replicas: [
    {
      nodeId: "d",
      nodeName: "Бета",
      priority: 1,
      status: "up",
      statusMessage: null,
    },
  ],
} as unknown as WgInterfaceDto;

const renderCell = (
  props: Partial<Parameters<typeof InterfaceReplicasCell>[0]>,
) =>
  render(
    <TooltipProvider>
      <InterfaceReplicasCell
        iface={iface}
        canManageReplicas
        onRemoveReplica={vi.fn()}
        {...props}
      />
    </TooltipProvider>,
  );

describe("InterfaceReplicasCell", () => {
  it("основная и реплики, отметка копии с трафиком", () => {
    renderCell({});

    expect(screen.getByText("Альфа")).toBeTruthy();
    expect(screen.getByText("Бета")).toBeTruthy();
    expect(screen.getByLabelText("Трафик идёт через Бета")).toBeTruthy();
  });

  it("удаление реплики", () => {
    const onRemoveReplica = vi.fn();

    renderCell({ onRemoveReplica });
    fireEvent.click(screen.getByLabelText("Убрать копию Бета"));

    expect(onRemoveReplica).toHaveBeenCalledWith(iface, "d");
  });

  it("строка «куда идёт трафик» — отдельно: релей, копия, авто", () => {
    render(
      <InterfaceTrafficNote
        iface={
          {
            ...iface,
            endpoint: {
              name: "msk-relay",
              mode: "relay",
              relayNodeId: "r",
              relayNodeName: "MSK",
            },
          } as unknown as WgInterfaceDto
        }
      />,
    );

    expect(screen.getByText(/релей MSK/)).toBeTruthy();
    expect(screen.getByText("Бета")).toBeTruthy();
    expect(screen.getByText(/авто/)).toBeTruthy();
  });

  it("выбора копии в ячейке нет, у основной нет кнопки удаления", () => {
    renderCell({});

    expect(screen.queryByLabelText("Трафик через копию")).toBeNull();
    expect(screen.queryByLabelText("Убрать копию Альфа")).toBeNull();
    expect(screen.getByText("основная")).toBeTruthy();
  });

  it("копия на ноде без агента — «Ожидает агента» вместо статуса интерфейса", () => {
    renderCell({
      iface: {
        ...iface,
        replicas: [
          {
            nodeId: "n",
            nodeName: "Алматы",
            nodeStatus: "created",
            priority: 1,
            status: "unknown",
            statusMessage: null,
          },
        ],
      } as unknown as WgInterfaceDto,
    });

    expect(screen.getByText("Ожидает агента")).toBeTruthy();
    expect(screen.queryByText("Неизвестно")).toBeNull();
  });

  it("копии — ссылки на страницу ноды", () => {
    renderCell({});

    expect(screen.getByText("Бета").closest("a")?.getAttribute("href")).toBe(
      "/wg/nodes/d",
    );
    expect(screen.getByText("Альфа").closest("a")?.getAttribute("href")).toBe(
      "/wg/nodes/a",
    );
  });
});
