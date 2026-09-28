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

import { WgSocksPage } from "../WgSocksPage";

const bind = (permissions: string[]) => {
  iocContainer.bind(ISocketTransport.Tid).toConstantValue(createFakeSocket());
  iocContainer
    .bind(IMainApi.Tid)
    .toConstantValue({ listWgSocks: vi.fn().mockResolvedValue({ data: [] }) });
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
        <WgSocksPage />
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

describe("WgSocksPage", () => {
  it("без права управления нет кнопки «Новый прокси»", () => {
    bind([WG_PERMISSIONS.SOCKS_VIEW]);
    renderPage();

    expect(screen.queryByRole("button", { name: "Новый прокси" })).toBeNull();
  });

  it("с правом создания кнопка «Новый прокси» есть", () => {
    bind([WG_PERMISSIONS.SOCKS_VIEW, WG_PERMISSIONS.SOCKS_CREATE]);
    renderPage();

    expect(screen.getByRole("button", { name: "Новый прокси" })).toBeTruthy();
  });
});
