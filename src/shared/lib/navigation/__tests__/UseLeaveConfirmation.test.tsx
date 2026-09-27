import { ModalProvider } from "@shared/ui";
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  RouterProvider,
} from "@tanstack/react-router";
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import {
  type LeaveConfirmation,
  useLeaveConfirmation,
  type UseLeaveConfirmationOptions,
} from "../use-leave-confirmation";

type Options = UseLeaveConfirmationOptions;

/** Страница «/form» с охраной ухода и роутер с соседними «/other» и «/form?tab». */
const setup = (options: Options) => {
  const controls: { current: LeaveConfirmation | null } = { current: null };

  const FormPage = () => {
    controls.current = useLeaveConfirmation(options);

    return <p>Форма</p>;
  };

  const rootRoute = createRootRoute({
    component: () => (
      <ModalProvider>
        <Outlet />
      </ModalProvider>
    ),
  });
  const formRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/form",
    component: FormPage,
  });
  const otherRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/other",
    component: () => <p>Другая</p>,
  });
  const router = createRouter({
    routeTree: rootRoute.addChildren([formRoute, otherRoute]),
    history: createMemoryHistory({ initialEntries: ["/form"] }),
  });

  render(<RouterProvider router={router} />);

  /**
   * Переход через историю и без `act`: он висит, пока открыт диалог, а `act`
   * не отдал бы обновления (сам диалог) до своего завершения. Охрана ловит
   * и `navigate`, и ссылки, и «назад» — все они идут через историю.
   */
  const go = (to: string) => {
    router.history.push(to);
  };

  return { router, controls, go };
};

const pathname = (router: ReturnType<typeof setup>["router"]) =>
  router.state.location.pathname;

describe("useLeaveConfirmation", () => {
  it("без изменений уходит без вопроса", async () => {
    const { router, go } = setup({ when: false });

    await screen.findByText("Форма");
    go("/other");

    await screen.findByText("Другая");
    expect(pathname(router)).toBe("/other");
  });

  it("с изменениями спрашивает: «Остаться» оставляет, «Уйти» уводит", async () => {
    const { router, go } = setup({ when: true });

    await screen.findByText("Форма");
    go("/other");

    const dialog = await screen.findByRole("dialog");

    expect(dialog).toHaveTextContent("Уйти со страницы?");
    fireEvent.click(screen.getByRole("button", { name: "Остаться" }));

    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    expect(pathname(router)).toBe("/form");

    go("/other");
    fireEvent.click(await screen.findByRole("button", { name: "Уйти" }));

    await screen.findByText("Другая");
    expect(pathname(router)).toBe("/other");
  });

  it("when-функция читается в момент перехода", async () => {
    let dirty = false;
    const { router, go } = setup({ when: () => dirty });

    await screen.findByText("Форма");
    dirty = true;
    go("/other");

    expect(await screen.findByRole("dialog")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Остаться" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());

    dirty = false;
    go("/other");

    await screen.findByText("Другая");
    expect(pathname(router)).toBe("/other");
  });

  it("тексты диалога настраиваются", async () => {
    const { go } = setup({
      when: true,
      dialog: {
        title: "Правки не сохранены",
        confirmLabel: "Сохранить и перейти",
      },
    });

    await screen.findByText("Форма");
    go("/other");

    expect(await screen.findByRole("dialog")).toHaveTextContent(
      "Правки не сохранены",
    );
    expect(
      screen.getByRole("button", { name: "Сохранить и перейти" }),
    ).toBeInTheDocument();
  });

  it("onConfirm после согласия: false — остаться (например, не сохранилось)", async () => {
    const onConfirm = vi
      .fn()
      .mockResolvedValueOnce(false)
      .mockResolvedValue(true);
    const { router, go } = setup({ when: true, onConfirm });

    await screen.findByText("Форма");
    go("/other");
    fireEvent.click(await screen.findByRole("button", { name: "Уйти" }));

    await waitFor(() => expect(onConfirm).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    expect(pathname(router)).toBe("/form");

    go("/other");
    fireEvent.click(await screen.findByRole("button", { name: "Уйти" }));

    await screen.findByText("Другая");
    expect(onConfirm).toHaveBeenCalledTimes(2);
  });

  it("confirm заменяет модалку своим подтверждением", async () => {
    const confirm = vi.fn().mockResolvedValue(true);
    const { router, go } = setup({ when: true, confirm });

    await screen.findByText("Форма");
    go("/other");

    await screen.findByText("Другая");
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(confirm).toHaveBeenCalledWith(
      expect.objectContaining({
        current: expect.objectContaining({ pathname: "/form" }),
        next: expect.objectContaining({ pathname: "/other" }),
      }),
    );
    expect(pathname(router)).toBe("/other");
  });

  it("смена только search на той же странице не спрашивает, пока не включён blockSamePath", async () => {
    const { router, go } = setup({ when: true });

    await screen.findByText("Форма");
    go("/form?tab=2");

    await waitFor(() => expect(router.state.location.searchStr).toBe("?tab=2"));
    expect(screen.queryByRole("dialog")).toBeNull();

    go("/other");
    expect(await screen.findByRole("dialog")).toBeInTheDocument();
  });

  it("shouldBlock отфильтровывает переходы", async () => {
    const { router, go } = setup({
      when: true,
      shouldBlock: ({ next }) => next.pathname !== "/other",
    });

    await screen.findByText("Форма");
    go("/other");

    await screen.findByText("Другая");
    expect(pathname(router)).toBe("/other");
  });

  it("withoutConfirmation выполняет переход без вопроса", async () => {
    const { router, controls, go } = setup({ when: true });

    await screen.findByText("Форма");
    await act(() => controls.current!.withoutConfirmation(() => go("/other")));

    expect(pathname(router)).toBe("/other");
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("закрытие вкладки: beforeunload отменяется только при изменениях", async () => {
    let dirty = true;

    setup({ when: () => dirty });
    await screen.findByText("Форма");

    const blocked = new Event("beforeunload", { cancelable: true });

    window.dispatchEvent(blocked);
    expect(blocked.defaultPrevented).toBe(true);

    dirty = false;

    const free = new Event("beforeunload", { cancelable: true });

    window.dispatchEvent(free);
    expect(free.defaultPrevented).toBe(false);
  });

  it("disabled выключает охрану целиком", async () => {
    const { router, go } = setup({ when: true, disabled: true });

    await screen.findByText("Форма");
    go("/other");

    await screen.findByText("Другая");
    expect(pathname(router)).toBe("/other");
  });
});
