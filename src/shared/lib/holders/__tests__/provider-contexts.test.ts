import { renderHook } from "@testing-library/react";
import { type ComponentType, createElement, type ReactNode } from "react";

import { CollectionProvider } from "../collection/CollectionProvider";
import { useCollectionContext } from "../collection/use-collection-context";
import { EntityProvider } from "../entity/EntityProvider";
import { useEntityContext } from "../entity/use-entity-context";
import { InfiniteProvider } from "../infinite/InfiniteProvider";
import { useInfiniteContext } from "../infinite/use-infinite-context";
import { MutationProvider } from "../mutation/MutationProvider";
import { useMutationContext } from "../mutation/use-mutation-context";
import { PagedProvider } from "../paged/PagedProvider";
import { usePagedContext } from "../paged/use-paged-context";
import { PollingProvider } from "../polling/PollingProvider";
import { usePollingContext } from "../polling/use-polling-context";

type AnyProvider = ComponentType<{ value?: unknown; children?: ReactNode }>;

const withProvider =
  (Provider: AnyProvider, value?: unknown) =>
  ({ children }: { children: ReactNode }) =>
    createElement(Provider, { value }, children);

describe("providers and contexts", () => {
  const specs = [
    [CollectionProvider, useCollectionContext],
    [EntityProvider, useEntityContext],
    [InfiniteProvider, useInfiniteContext],
    [MutationProvider, useMutationContext],
    [PagedProvider, usePagedContext],
    [PollingProvider, usePollingContext],
  ] as const;

  it.each(specs)(
    "provides an external value through %p",
    (Provider, useContextValue) => {
      const value = { marker: true };
      const { result } = renderHook(() => useContextValue(), {
        wrapper: withProvider(Provider as unknown as AnyProvider, value),
      });

      expect(result.current).toBe(value);
    },
  );

  it.each(specs)(
    "creates an internal value in %p",
    (Provider, useContextValue) => {
      const { result } = renderHook(() => useContextValue(), {
        wrapper: withProvider(Provider as unknown as AnyProvider),
      });

      expect(result.current).toHaveProperty("holder");
    },
  );

  it("reports context usage outside its provider", () => {
    // React пишет в console.error об ошибке рендера — здесь она ожидаема.
    vi.spyOn(console, "error").mockImplementation(() => undefined);

    expect(() => renderHook(() => useEntityContext())).toThrow(
      "useEntityContext must be used within EntityProvider",
    );
  });
});
