import { useCallback, useMemo, useState } from "react";

import type { ChartSeries } from "../chart.types";

export interface UseSeriesVisibilityResult {
  hiddenKeys: ReadonlySet<string>;
  toggle: (key: string) => void;
}

/**
 * Видимость серий для легенды. Последнюю видимую серию скрыть нельзя —
 * пустой график вместо данных читается как поломка, а не как фильтр.
 */
export const useSeriesVisibility = <Datum>(
  series: ChartSeries<Datum>[],
): UseSeriesVisibilityResult => {
  const [hidden, setHidden] = useState<string[]>(() =>
    series.filter(item => item.hidden).map(item => item.key),
  );

  const keys = useMemo(() => series.map(item => item.key), [series]);

  const hiddenKeys = useMemo(
    () => new Set(hidden.filter(key => keys.includes(key))),
    [hidden, keys],
  );

  const toggle = useCallback(
    (key: string) =>
      setHidden(current => {
        if (current.includes(key)) {
          return current.filter(item => item !== key);
        }

        const next = [...current, key];

        return next.length >= keys.length ? current : next;
      }),
    [keys],
  );

  return { hiddenKeys, toggle };
};
