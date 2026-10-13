import { formatSince, sinceTickMs } from "@shared/lib/utils";
import { useEffect, useState } from "react";

/**
 * «12 с назад» от момента `at` (мс), обновляется само: в первую минуту —
 * каждую секунду, дальше реже. `at` нет — `null`.
 */
export const useTimeSince = (at: number | null | undefined): string | null => {
  const [now, setNow] = useState(() => Date.now());
  const delay = at ? sinceTickMs(at, now) : null;

  useEffect(() => {
    if (delay === null) return;

    const timer = setTimeout(() => setNow(Date.now()), delay);

    return () => clearTimeout(timer);
  }, [delay, now]);

  return at ? formatSince(at, now) : null;
};
