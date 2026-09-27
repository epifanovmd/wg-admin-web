import { act, fireEvent, render, screen } from "@testing-library/react";
import * as React from "react";
import { vi } from "vitest";

import { Modal, ModalContent } from "../../modal";
import { TooltipProvider } from "../../tooltip";
import { CopyableText } from "../CopyableText";

describe("CopyableText", () => {
  it("copies the text, stops propagation and announces the result", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    const onCopied = vi.fn();
    const onRowClick = vi.fn();

    Object.assign(navigator, { clipboard: { writeText } });

    render(
      <TooltipProvider>
        <div onClick={onRowClick}>
          <CopyableText text="abc-123" onCopied={onCopied} />
        </div>
      </TooltipProvider>,
    );

    const button = screen.getByRole("button", { name: "Копировать: abc-123" });

    await act(async () => {
      fireEvent.click(button);
    });

    expect(writeText).toHaveBeenCalledWith("abc-123");
    expect(onRowClick).not.toHaveBeenCalled();
    expect(onCopied).toHaveBeenCalledTimes(1);
    expect(button).toHaveTextContent("Скопировано");
  });

  it("без Clipboard API (страница по http) копирует через выделение текста", async () => {
    const execCommand = vi.fn().mockReturnValue(true);
    const onCopied = vi.fn();

    Object.assign(navigator, { clipboard: undefined });
    Object.assign(document, { execCommand });

    render(
      <TooltipProvider>
        <CopyableText text="key.secret" onCopied={onCopied} />
      </TooltipProvider>,
    );

    const button = screen.getByRole("button", {
      name: "Копировать: key.secret",
    });

    await act(async () => {
      fireEvent.click(button);
    });

    expect(execCommand).toHaveBeenCalledWith("copy");
    expect(onCopied).toHaveBeenCalledTimes(1);
    expect(button).toHaveTextContent("Скопировано");
  });

  it("без Clipboard API копирует и внутри модалки с ловушкой фокуса", async () => {
    // Копируется только то, что выделено в поле с фокусом.
    let copied = "";
    const execCommand = vi.fn(() => {
      const active = document.activeElement;

      if (active instanceof HTMLTextAreaElement) {
        copied = active.value.slice(active.selectionStart, active.selectionEnd);
      }

      return copied !== "";
    });

    Object.assign(navigator, { clipboard: undefined });
    Object.assign(document, { execCommand });

    render(
      <TooltipProvider>
        <Modal open>
          <ModalContent title="Ключ">
            <CopyableText text="key.secret" />
          </ModalContent>
        </Modal>
      </TooltipProvider>,
    );

    const button = screen.getByRole("button", {
      name: "Копировать: key.secret",
    });

    await act(async () => {
      fireEvent.click(button);
    });

    expect(copied).toBe("key.secret");
    expect(button).toHaveTextContent("Скопировано");
  });
});
