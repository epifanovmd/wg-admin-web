import { useHolderRef } from "@shared/lib/holders";
import { useEvent } from "@shared/lib/hooks";
import { type DependencyList, useEffect } from "react";

import { AuditFeed, type AuditPageFetcher } from "./audit-feed";

/** Лента журнала; перезагружается при смене `deps` (например, фильтра). */
export const useAuditFeed = (fetch: AuditPageFetcher, deps: DependencyList) => {
  const fetchLatest = useEvent(fetch);
  const feed = useHolderRef(() => new AuditFeed(fetchLatest));

  useEffect(() => {
    feed.load().then();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return feed;
};
