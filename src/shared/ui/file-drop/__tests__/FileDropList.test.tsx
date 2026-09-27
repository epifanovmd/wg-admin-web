import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { FileDropList } from "../FileDropList";

const image = new File([new Uint8Array(10)], "photo.png", {
  type: "image/png",
});
const doc = new File([new Uint8Array(1.2 * 1024 * 1024)], "report.pdf", {
  type: "application/pdf",
});

describe("FileDropList", () => {
  const createObjectURL = vi.fn(() => "blob:preview");
  const revokeObjectURL = vi.fn();

  beforeEach(() => {
    vi.stubGlobal("URL", { ...URL, createObjectURL, revokeObjectURL });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    createObjectURL.mockClear();
    revokeObjectURL.mockClear();
  });

  it("показывает имя, размер, прогресс и ошибку", () => {
    render(
      <FileDropList
        items={[
          { id: "1", file: doc, progress: 0.4 },
          { id: "2", file: image, error: "Сервер недоступен" },
        ]}
      />,
    );

    expect(screen.getByText("report.pdf")).toBeInTheDocument();
    expect(screen.getByText("1,2 МБ")).toBeInTheDocument();
    expect(screen.getByRole("progressbar")).toHaveAttribute(
      "aria-valuenow",
      "40",
    );
    expect(screen.getByText("Сервер недоступен")).toBeInTheDocument();
  });

  it("строит превью изображения и освобождает object URL при размонтировании", () => {
    const { container, unmount } = render(
      <FileDropList items={[{ id: "1", file: image }]} />,
    );

    expect(container.querySelector("img")).toHaveAttribute(
      "src",
      "blob:preview",
    );
    expect(createObjectURL).toHaveBeenCalledWith(image);

    unmount();

    expect(revokeObjectURL).toHaveBeenCalledWith("blob:preview");
  });

  it("не строит превью для не-изображений", () => {
    render(<FileDropList items={[{ id: "1", file: doc }]} />);

    expect(createObjectURL).not.toHaveBeenCalled();
  });

  it("кнопка удаления подписана именем файла", () => {
    const onRemove = vi.fn();
    const item = { id: "1", file: doc };

    render(<FileDropList items={[item]} onRemove={onRemove} />);

    fireEvent.click(
      screen.getByRole("button", { name: "Удалить файл report.pdf" }),
    );

    expect(onRemove).toHaveBeenCalledWith(item);
  });
});
