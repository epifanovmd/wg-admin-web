import { fireEvent, render, screen } from "@testing-library/react";
import * as React from "react";
import { vi } from "vitest";

import { FileDrop } from "../FileDrop";

const makeFile = (name: string, type: string) =>
  new File(["x"], name, { type });

const dropFiles = (target: Element, files: File[]) =>
  fireEvent.drop(target, { dataTransfer: { files } });

describe("FileDrop", () => {
  it("keeps the drag highlight while moving over child elements", () => {
    render(<FileDrop onFiles={() => {}} hint="подсказка" />);

    const zone = screen.getByRole("button");
    const hint = screen.getByText("подсказка");

    fireEvent.dragEnter(zone);
    expect(zone).toHaveAttribute("data-drag-over");

    fireEvent.dragEnter(hint);
    fireEvent.dragLeave(hint);
    expect(zone).toHaveAttribute("data-drag-over");

    fireEvent.dragLeave(zone);
    expect(zone).not.toHaveAttribute("data-drag-over");
  });

  it("applies accept on drop and reports rejected files", () => {
    const onFiles = vi.fn();
    const onReject = vi.fn();

    render(<FileDrop onFiles={onFiles} onReject={onReject} accept="image/*" />);

    const image = makeFile("a.png", "image/png");
    const doc = makeFile("b.pdf", "application/pdf");

    dropFiles(screen.getByRole("button"), [image, doc]);

    expect(onFiles).toHaveBeenCalledWith([image]);
    expect(onReject).toHaveBeenCalledWith(
      [doc],
      [{ file: doc, reason: "type" }],
    );
  });

  it("links the hint through aria-describedby and passes inputProps", () => {
    render(
      <FileDrop
        onFiles={() => {}}
        hint="до 5 МБ"
        inputProps={{ name: "attachments" }}
      />,
    );

    const zone = screen.getByRole("button");
    const hint = screen.getByText("до 5 МБ");

    expect(zone).toHaveAttribute("aria-describedby", hint.id);
    expect(document.querySelector('input[name="attachments"]')).not.toBeNull();
  });
});

describe("FileDrop validation", () => {
  const sized = (name: string, type: string, size: number) =>
    new File([new Uint8Array(size)], name, { type });

  it("отклоняет по размеру и количеству с причинами, сохраняя первый аргумент onReject", () => {
    const onFiles = vi.fn();
    const onReject = vi.fn();

    render(
      <FileDrop
        onFiles={onFiles}
        onReject={onReject}
        accept="image/*"
        maxSize={100}
        maxFiles={2}
      />,
    );

    const ok1 = sized("a.png", "image/png", 10);
    const big = sized("b.png", "image/png", 500);
    const doc = sized("c.pdf", "application/pdf", 10);
    const ok2 = sized("d.png", "image/png", 10);
    const extra = sized("e.png", "image/png", 10);

    dropFiles(screen.getByRole("button"), [ok1, big, doc, ok2, extra]);

    expect(onFiles).toHaveBeenCalledWith([ok1, ok2]);
    expect(onReject).toHaveBeenCalledWith(
      [big, doc, extra],
      [
        { file: big, reason: "size" },
        { file: doc, reason: "type" },
        { file: extra, reason: "count" },
      ],
    );
  });

  it("проверяет и файлы, выбранные через диалог", () => {
    const onFiles = vi.fn();
    const onReject = vi.fn();

    render(<FileDrop onFiles={onFiles} onReject={onReject} maxSize={5} />);

    const input =
      document.querySelector<HTMLInputElement>('input[type="file"]')!;
    const big = sized("a.txt", "text/plain", 50);

    fireEvent.change(input, { target: { files: [big] } });

    expect(onFiles).not.toHaveBeenCalled();
    expect(onReject).toHaveBeenCalledWith(
      [big],
      [{ file: big, reason: "size" }],
    );
  });

  it("без multiple и maxFiles по-прежнему молча берёт первый файл", () => {
    const onFiles = vi.fn();
    const onReject = vi.fn();

    render(<FileDrop onFiles={onFiles} onReject={onReject} multiple={false} />);

    const a = makeFile("a.txt", "text/plain");
    const b = makeFile("b.txt", "text/plain");

    dropFiles(screen.getByRole("button"), [a, b]);

    expect(onFiles).toHaveBeenCalledWith([a]);
    expect(onReject).not.toHaveBeenCalled();
  });
});
