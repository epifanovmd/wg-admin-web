import { IUserStore } from "@entities/user";
import { IWgNodesStore, WG_PERMISSIONS } from "@entities/wg";
import { IMainApi } from "@shared/api";
import { iocContainer } from "@shared/lib/di";
import { INotificationService } from "@shared/lib/notifications";
import { ISocketTransport } from "@shared/lib/socket";
import { createFakeSocket } from "@shared/lib/socket/testing";
import { ModalProvider, TooltipProvider } from "@shared/ui";
import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { WgEndpointsPage } from "../WgEndpointsPage";

const bind = (permissions: string[]) => {
  iocContainer.bind(ISocketTransport.Tid).toConstantValue(createFakeSocket());
  iocContainer.bind(IMainApi.Tid).toConstantValue({
    listWgEndpoints: vi.fn().mockResolvedValue({ data: { items: [] } }),
  });
  iocContainer
    .bind(INotificationService.Tid)
    .toConstantValue({ error: vi.fn(), success: vi.fn() });
  iocContainer.bind(IUserStore.Tid).toConstantValue({
    user: { id: "u1" },
    can: (permission: string) => permissions.includes(permission),
  });
  iocContainer.bind(IWgNodesStore.Tid).toConstantValue({
    nodes: [],
    load: vi.fn().mockResolvedValue(undefined),
    byId: () => undefined,
    options: vi.fn().mockResolvedValue([]),
  });
};

const renderPage = () =>
  render(
    <TooltipProvider>
      <ModalProvider>
        <WgEndpointsPage />
      </ModalProvider>
    </TooltipProvider>,
  );

afterEach(() => {
  iocContainer.unbind(ISocketTransport.Tid);
  iocContainer.unbind(IMainApi.Tid);
  iocContainer.unbind(INotificationService.Tid);
  iocContainer.unbind(IUserStore.Tid);
  iocContainer.unbind(IWgNodesStore.Tid);
});

describe("WgEndpointsPage", () => {
  it("без права управления нет кнопки «Новая точка»", () => {
    bind([WG_PERMISSIONS.ENDPOINT_VIEW]);
    renderPage();

    expect(screen.queryByRole("button", { name: "Новая точка" })).toBeNull();
  });

  it("с правом управления кнопка «Новая точка» есть", () => {
    bind([WG_PERMISSIONS.ENDPOINT_VIEW, WG_PERMISSIONS.ENDPOINT_MANAGE]);
    renderPage();

    expect(screen.getByRole("button", { name: "Новая точка" })).toBeTruthy();
  });
});
