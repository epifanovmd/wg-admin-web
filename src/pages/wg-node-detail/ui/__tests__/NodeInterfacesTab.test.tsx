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
  InterfaceReplicasCell: ({
    iface,
    onPin,
  }: {
    iface: WgInterfaceDto;
    onPin: (iface: WgInterfaceDto, nodeId: string | null) => void;
  }) => <button onClick={() => onPin(iface, null)}>Закрепить</button>,
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
  onPin: vi.fn(),
  onRemoveReplica: vi.fn(),
};

const renderTab = () =>
  render(
    <TooltipProvider>
      <NodeInterfacesTab
        interfaces={[iface]}
        isLoading={false}
        canManage
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

  it("кнопки действий и копий строку не открывают", () => {
    renderTab();
    fireEvent.click(screen.getByLabelText("Перезапустить"));
    fireEvent.click(screen.getByText("Закрепить"));

    expect(handlers.onRestart).toHaveBeenCalledOnce();
    expect(handlers.onPin).toHaveBeenCalledOnce();
    expect(navigate).not.toHaveBeenCalled();
  });
});
