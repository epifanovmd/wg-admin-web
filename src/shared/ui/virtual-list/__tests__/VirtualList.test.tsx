import { act, fireEvent, render, screen } from "@testing-library/react";
import * as React from "react";

import { VirtualList } from "../VirtualList";

const VIEWPORT = 200;
const ROW = 20;

const ITEMS = Array.from({ length: 1000 }, (_, i) => `Строка ${i + 1}`);

const originalOffsetHeight = Object.getOwnPropertyDescriptor(
  HTMLElement.prototype,
  "offsetHeight",
);

/** jsdom не считает layout: скроллер — VIEWPORT, строки — ROW. */
const mockLayout = () => {
  Object.defineProperty(HTMLElement.prototype, "offsetHeight", {
    configurable: true,
    get() {
      return (this as HTMLElement).dataset.testid === "scroller"
        ? VIEWPORT
        : ROW;
    },
  });
};

const restoreLayout = () => {
  if (originalOffsetHeight) {
    Object.defineProperty(
      HTMLElement.prototype,
      "offsetHeight",
      originalOffsetHeight,
    );
  }
};

const scrollTo = (element: HTMLElement, top: number) => {
  act(() => {
    element.scrollTop = top;
    fireEvent.scroll(element);
  });
};

describe("VirtualList", () => {
  beforeEach(mockLayout);
  afterEach(restoreLayout);

  it("рендерит только окно строк", () => {
    render(
      <VirtualList
        data-testid="scroller"
        items={ITEMS}
        estimateSize={ROW}
        overscan={2}
        height={VIEWPORT}
        renderItem={item => <span>{item}</span>}
      />,
    );

    expect(screen.getByText("Строка 1")).toBeInTheDocument();
    expect(screen.queryByText("Строка 100")).toBeNull();
    expect(screen.getAllByText(/^Строка /).length).toBeLessThan(20);
  });

  it("сдвигает окно при прокрутке", () => {
    render(
      <VirtualList
        data-testid="scroller"
        items={ITEMS}
        estimateSize={ROW}
        height={VIEWPORT}
        renderItem={item => <span>{item}</span>}
      />,
    );

    scrollTo(screen.getByTestId("scroller"), ROW * 500);

    expect(screen.getByText("Строка 501")).toBeInTheDocument();
    expect(screen.queryByText("Строка 1")).toBeNull();
  });

  it("вызывает onEndReached у конца списка один раз на длину", () => {
    const onEndReached = vi.fn();

    render(
      <VirtualList
        data-testid="scroller"
        items={ITEMS}
        estimateSize={ROW}
        height={VIEWPORT}
        onEndReached={onEndReached}
        endReachedThreshold={10}
        renderItem={item => <span>{item}</span>}
      />,
    );

    expect(onEndReached).not.toHaveBeenCalled();

    const scroller = screen.getByTestId("scroller");

    scrollTo(scroller, ROW * 985);
    scrollTo(scroller, ROW * 990);

    expect(onEndReached).toHaveBeenCalledTimes(1);
  });

  it("показывает emptyContent при пустом списке", () => {
    render(
      <VirtualList
        items={[] as string[]}
        estimateSize={ROW}
        emptyContent="Пусто"
        renderItem={item => item}
      />,
    );

    expect(screen.getByText("Пусто")).toBeInTheDocument();
  });

  it("использует внешний скролл-контейнер", () => {
    const External = () => {
      const scrollRef = React.useRef<HTMLDivElement>(null);

      return (
        <div
          ref={scrollRef}
          data-testid="scroller"
          style={{ overflow: "auto" }}
        >
          <VirtualList
            data-testid="inner"
            items={ITEMS}
            estimateSize={ROW}
            scrollElementRef={scrollRef}
            renderItem={item => <span>{item}</span>}
          />
        </div>
      );
    };

    render(<External />);

    expect(screen.getByTestId("inner")).toHaveStyle({
      height: `${ITEMS.length * ROW}px`,
    });

    scrollTo(screen.getByTestId("scroller"), ROW * 300);

    expect(screen.getByText("Строка 301")).toBeInTheDocument();
  });

  it("берёт ключи из getItemKey", () => {
    const { container } = render(
      <VirtualList
        data-testid="scroller"
        items={ITEMS.slice(0, 3)}
        estimateSize={ROW}
        height={VIEWPORT}
        getItemKey={item => item}
        renderItem={item => item}
      />,
    );

    expect(container.querySelectorAll("[data-index]")).toHaveLength(3);
  });
});
