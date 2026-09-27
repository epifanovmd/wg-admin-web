import { act, render } from "@testing-library/react";
import * as React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useInfiniteScrollSentinel } from "../use-infinite-scroll-sentinel";

type IntersectionCallback = (entries: IntersectionObserverEntry[]) => void;

interface ObserverRecord {
  callback: IntersectionCallback;
  observe: ReturnType<typeof vi.fn>;
  unobserve: ReturnType<typeof vi.fn>;
  disconnect: ReturnType<typeof vi.fn>;
  options?: IntersectionObserverInit;
}

const observers: ObserverRecord[] = [];

class IntersectionObserverMock {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();

  constructor(
    callback: IntersectionCallback,
    options?: IntersectionObserverInit,
  ) {
    observers.push({
      callback,
      observe: this.observe,
      unobserve: this.unobserve,
      disconnect: this.disconnect,
      options,
    });
  }
}

const intersect = (record: ObserverRecord) =>
  act(() =>
    record.callback([{ isIntersecting: true } as IntersectionObserverEntry]),
  );

interface ListProps {
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  onLoadMore: () => void;
  rootMargin?: string;
}

const List = (props: ListProps) => {
  const ref = useInfiniteScrollSentinel<HTMLLIElement>(props);

  return (
    <ul>
      <li ref={ref}>sentinel</li>
    </ul>
  );
};

describe("useInfiniteScrollSentinel", () => {
  beforeEach(() => {
    observers.length = 0;
    vi.stubGlobal("IntersectionObserver", IntersectionObserverMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("зовёт onLoadMore при пересечении и не пересоздаёт observer при смене колбэка", () => {
    const first = vi.fn();
    const second = vi.fn();
    const { rerender } = render(
      <List hasNextPage isFetchingNextPage={false} onLoadMore={first} />,
    );

    expect(observers).toHaveLength(1);
    expect(observers[0]?.options?.rootMargin).toBe("0px 0px 100% 0px");

    rerender(
      <List hasNextPage isFetchingNextPage={false} onLoadMore={second} />,
    );

    expect(observers).toHaveLength(1);

    intersect(observers[0]!);

    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledTimes(1);
  });

  it("не зовёт onLoadMore во время загрузки и переподписывается после неё", () => {
    const onLoadMore = vi.fn();
    const { rerender } = render(
      <List hasNextPage isFetchingNextPage onLoadMore={onLoadMore} />,
    );

    intersect(observers[0]!);

    expect(onLoadMore).not.toHaveBeenCalled();

    rerender(
      <List hasNextPage isFetchingNextPage={false} onLoadMore={onLoadMore} />,
    );

    expect(observers).toHaveLength(1);
    expect(observers[0]?.unobserve).toHaveBeenCalledTimes(1);
    expect(observers[0]?.observe).toHaveBeenCalledTimes(2);
  });

  it("не создаёт observer без следующей страницы и отключает его при её исчезновении", () => {
    const { rerender } = render(
      <List
        hasNextPage={false}
        isFetchingNextPage={false}
        onLoadMore={() => {}}
      />,
    );

    expect(observers).toHaveLength(0);

    rerender(
      <List hasNextPage isFetchingNextPage={false} onLoadMore={() => {}} />,
    );
    rerender(
      <List
        hasNextPage={false}
        isFetchingNextPage={false}
        onLoadMore={() => {}}
      />,
    );

    expect(observers[0]?.disconnect).toHaveBeenCalledTimes(1);
  });

  it("ничего не делает, если IntersectionObserver недоступен", () => {
    vi.stubGlobal("IntersectionObserver", undefined);

    const onLoadMore = vi.fn();

    expect(() =>
      render(
        <List hasNextPage isFetchingNextPage={false} onLoadMore={onLoadMore} />,
      ),
    ).not.toThrow();
    expect(onLoadMore).not.toHaveBeenCalled();
  });
});
