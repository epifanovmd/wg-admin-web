import { TooltipProvider } from "@radix-ui/react-tooltip";
import type { WgInterfaceDto } from "@shared/api/gen/main/model";
import { fireEvent, render, screen } from "@testing-library/react";
import { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { NodeInterfacesTab } from "../NodeInterfacesTab";

const navigate = vi.fn();

vi.mock("@tanstack/react-router", () => ({
  Link: ({ children }: { children: ReactNode }) => <a>{children}</a>,
  useNavigate: () => navigate,
}));
vi.mock("@features/manage-wg-interface", () => ({
  hasAnyInterfaceAction: () => true,
  InterfaceStatusCompact: () => <span>Up</span>,
}));

const iface = {
  id: "i1",
  nodeId: "n1",
  name: "wg0",
  addressCidr: "10.8.0.1/24",
  addressV6Cidr: null,
  listenPort: 51820,
  clientEndpoint: "203.0.113.10:51822",
  endpointId: "e1",
  natEnabled: true,
  enabled: true,
  replicas: [],
} as unknown as WgInterfaceDto;

const handlers = {
  onEdit: vi.fn(),
  onToggle: vi.fn().mockResolvedValue(true),
  onRestart: vi.fn(),
  onDelete: vi.fn(),
  onMove: vi.fn(),
  onCopy: vi.fn(),
  onRemoveReplica: vi.fn(),
};

const ALL_ACTIONS = {
  canCreate: true,
  accessKey: "all",
  accessOf: () => ({
    canUpdate: true,
    canDelete: true,
    canControl: true,
    canMove: true,
    canReplicas: true,
    canAssign: true,
  }),
};

const renderTab = (interfaces: WgInterfaceDto[] = [iface]) =>
  render(
    <TooltipProvider>
      <NodeInterfacesTab
        nodeId="n1"
        interfaces={interfaces}
        isLoading={false}
        access={ALL_ACTIONS}
        {...handlers}
      />
    </TooltipProvider>,
  );

describe("NodeInterfacesTab", () => {
  beforeEach(() => vi.clearAllMocks());

  it("клик по строке открывает интерфейс", () => {
    renderTab();
    fireEvent.click(screen.getByText("203.0.113.10:51822"));

    expect(navigate).toHaveBeenCalledWith({
      to: "/wg/interfaces/$interfaceId",
      params: { interfaceId: "i1" },
    });
  });

  it("кнопки действий строку не открывают", () => {
    renderTab();
    fireEvent.click(screen.getByLabelText("Перезапустить"));

    expect(handlers.onRestart).toHaveBeenCalledOnce();
    expect(navigate).not.toHaveBeenCalled();
  });

  it("копия чужого интерфейса на ноде — помечена, действий нет", () => {
    renderTab([
      {
        ...iface,
        id: "i2",
        nodeId: "nl",
        nodeName: "Нидерланды",
      } as unknown as WgInterfaceDto,
    ]);

    expect(screen.getByText("копия · основная — Нидерланды")).toBeTruthy();
    expect(screen.queryByLabelText("Перезапустить")).toBeNull();

    // Единственное действие у копии — убрать её с этой ноды; строку не открывает.
    fireEvent.click(screen.getByLabelText("Убрать копию с этой ноды"));
    expect(handlers.onRemoveReplica).toHaveBeenCalledWith(
      expect.objectContaining({ id: "i2" }),
      "n1",
    );
    expect(navigate).not.toHaveBeenCalled();
  });
});
