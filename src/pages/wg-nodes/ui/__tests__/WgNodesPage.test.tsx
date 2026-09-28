import { IUserStore } from "@entities/user";
import { IWgNodesStore, WG_PERMISSIONS } from "@entities/wg";
import { IMainApi } from "@shared/api";
import type { WgNodeDto } from "@shared/api/gen/main/model";
import { iocContainer } from "@shared/lib/di";
import { INotificationService } from "@shared/lib/notifications";
import { ISocketTransport } from "@shared/lib/socket";
import { createFakeSocket } from "@shared/lib/socket/testing";
import { ModalProvider, TooltipProvider } from "@shared/ui";
import { fireEvent, render, screen } from "@testing-library/react";
import { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { WgNodesPage } from "../WgNodesPage";

const navigate = vi.fn();

vi.mock("@tanstack/react-router", () => ({
  Link: ({ children }: { children: ReactNode }) => <a>{children}</a>,
  useNavigate: () => navigate,
}));

const node = {
  id: "n1",
  name: "Альфа",
  publicHost: "192.0.2.30",
  description: null,
  status: "online",
  agentVersion: "2.0.0",
  lastSeenAt: null,
  applyError: null,
  inSync: true,
  hasAgentKey: true,
} as unknown as WgNodeDto;

const bind = (permissions: string[]) => {
  iocContainer.bind(ISocketTransport.Tid).toConstantValue(createFakeSocket());
  iocContainer.bind(IMainApi.Tid).toConstantValue({
    wgStatsMesh: vi.fn().mockResolvedValue({ data: null }),
    deleteWgNode: vi.fn().mockResolvedValue({ data: null }),
  });
  iocContainer
    .bind(INotificationService.Tid)
    .toConstantValue({ error: vi.fn(), success: vi.fn() });
  iocContainer.bind(IUserStore.Tid).toConstantValue({
    user: { id: "u1" },
    can: (permission: string) => permissions.includes(permission),
  });
  iocContainer.bind(IWgNodesStore.Tid).toConstantValue({
    nodes: [node],
    isLoading: false,
    error: null,
    load: vi.fn().mockResolvedValue(undefined),
    upsert: vi.fn(),
    remove: vi.fn(),
  });
};

const renderPage = () =>
  render(
    <TooltipProvider>
      <ModalProvider>
        <WgNodesPage />
      </ModalProvider>
    </TooltipProvider>,
  );

beforeEach(() => navigate.mockClear());

afterEach(() => {
  iocContainer.unbind(ISocketTransport.Tid);
  iocContainer.unbind(IMainApi.Tid);
  iocContainer.unbind(INotificationService.Tid);
  iocContainer.unbind(IUserStore.Tid);
  iocContainer.unbind(IWgNodesStore.Tid);
});

describe("WgNodesPage", () => {
  it.each(["Изменить", "Установить агента", "Удалить"])(
    "клик по действию «%s» не открывает ноду",
    name => {
      bind([
        WG_PERMISSIONS.NODE_VIEW,
        WG_PERMISSIONS.NODE_UPDATE,
        WG_PERMISSIONS.NODE_DELETE,
        WG_PERMISSIONS.NODE_PROVISION,
      ]);
      renderPage();

      fireEvent.click(screen.getByRole("button", { name }));

      expect(navigate).not.toHaveBeenCalled();
    },
  );

  it("клик по строке открывает ноду", () => {
    bind([WG_PERMISSIONS.NODE_VIEW]);
    renderPage();

    fireEvent.click(screen.getByText("Альфа").closest("tr")!);

    expect(navigate).toHaveBeenCalledWith({
      to: "/wg/nodes/$nodeId",
      params: { nodeId: "n1" },
    });
  });

  it("«Новая нода» — только с правом создания", () => {
    bind([WG_PERMISSIONS.NODE_VIEW]);
    const view = renderPage();

    expect(screen.queryByRole("button", { name: "Новая нода" })).toBeNull();
    view.unmount();
    iocContainer.unbind(IUserStore.Tid);
    iocContainer.bind(IUserStore.Tid).toConstantValue({
      user: { id: "u1" },
      can: () => true,
    });
    renderPage();

    expect(screen.getByRole("button", { name: "Новая нода" })).toBeTruthy();
  });
});
