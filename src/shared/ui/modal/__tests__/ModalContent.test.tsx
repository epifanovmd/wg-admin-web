import { act, fireEvent, render, screen } from "@testing-library/react";
import * as React from "react";
import { vi } from "vitest";

import { Modal } from "../Modal";

const flushOutsideListeners = () =>
  act(async () => {
    await new Promise(resolve => setTimeout(resolve, 0));
  });

describe("ModalContent", () => {
  it("owns its open state: opens from the trigger and closes from the confirm button", async () => {
    const onConfirm = vi.fn();

    render(
      <Modal>
        <Modal.Trigger>Открыть</Modal.Trigger>
        <Modal.Content title="Заголовок" onConfirm={onConfirm} />
      </Modal>,
    );

    fireEvent.click(screen.getByText("Открыть"));
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Подтвердить" }));
    });

    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("composes the user onEscapeKeyDown with the dismiss behaviour", () => {
    const onEscapeKeyDown = vi.fn();
    const onOpenChange = vi.fn();

    render(
      <Modal open onOpenChange={onOpenChange}>
        <Modal.Content title="Заголовок" onEscapeKeyDown={onEscapeKeyDown} />
      </Modal>,
    );

    fireEvent.keyDown(document.activeElement ?? document.body, {
      key: "Escape",
    });

    expect(onEscapeKeyDown).toHaveBeenCalledTimes(1);
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("keeps the user onPointerDownOutside while disableInteractOutside blocks dismissal", async () => {
    const onPointerDownOutside = vi.fn();
    const onOpenChange = vi.fn();

    render(
      <Modal open onOpenChange={onOpenChange}>
        <Modal.Content
          title="Заголовок"
          disableInteractOutside
          onPointerDownOutside={onPointerDownOutside}
        />
      </Modal>,
    );

    await flushOutsideListeners();
    fireEvent.pointerDown(document.body);
    fireEvent.click(document.body);

    expect(onPointerDownOutside).toHaveBeenCalledTimes(1);
    expect(onOpenChange).not.toHaveBeenCalled();

    fireEvent.keyDown(document.activeElement ?? document.body, {
      key: "Escape",
    });
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it("calls onCancel on every dismissal in confirm mode: ESC, close button, cancel button", () => {
    const onCancel = vi.fn();
    const onOpenChange = vi.fn();

    render(
      <Modal open onOpenChange={onOpenChange}>
        <Modal.Content title="Удалить?" onCancel={onCancel} />
      </Modal>,
    );

    fireEvent.keyDown(document.activeElement ?? document.body, {
      key: "Escape",
    });
    expect(onCancel).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole("button", { name: "Закрыть" }));
    expect(onCancel).toHaveBeenCalledTimes(2);

    fireEvent.click(screen.getByRole("button", { name: "Отмена" }));
    expect(onCancel).toHaveBeenCalledTimes(3);
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("stays open and reports the error when onConfirm rejects", async () => {
    const error = new Error("fail");
    const onConfirmError = vi.fn();
    const onOpenChange = vi.fn();

    render(
      <Modal open onOpenChange={onOpenChange}>
        <Modal.Content
          title="Заголовок"
          onConfirm={() => Promise.reject(error)}
          onConfirmError={onConfirmError}
        />
      </Modal>,
    );

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Подтвердить" }));
    });

    expect(onConfirmError).toHaveBeenCalledWith(error);
    expect(onOpenChange).not.toHaveBeenCalled();
  });
});

describe("ModalContent layout", () => {
  it("fullScreenOnMobile растягивает окно на экран ниже sm", () => {
    render(
      <Modal open>
        <Modal.Content title="Окно" fullScreenOnMobile>
          Тело
        </Modal.Content>
      </Modal>,
    );

    const dialog = screen.getByRole("dialog");

    expect(dialog).toHaveClass(
      "max-sm:inset-0",
      "max-sm:h-dvh",
      "max-sm:max-h-dvh",
      "max-sm:max-w-none",
      "max-sm:rounded-none",
      "max-sm:translate-x-0",
      "max-sm:translate-y-0",
    );
    expect(dialog.className).toContain("safe-area-inset-bottom");
    expect(dialog).toHaveClass("max-h-[85vh]");
  });

  it("без fullScreenOnMobile мобильных классов нет", () => {
    render(
      <Modal open>
        <Modal.Content title="Окно">Тело</Modal.Content>
      </Modal>,
    );

    expect(screen.getByRole("dialog").className).not.toContain("max-sm:");
  });

  it("size=full занимает почти весь экран и снимает ограничение высоты", () => {
    render(
      <Modal open>
        <Modal.Content title="Окно" size="full">
          Тело
        </Modal.Content>
      </Modal>,
    );

    const dialog = screen.getByRole("dialog");

    expect(dialog).toHaveClass(
      "w-[calc(100vw-2rem)]",
      "h-[calc(100dvh-2rem)]",
      "max-h-[calc(100dvh-2rem)]",
    );
    expect(dialog).not.toHaveClass("max-h-[85vh]");
  });
});
