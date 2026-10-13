const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

/**
 * Сколько прошло с момента `at` (мс) к `now`: «только что», «12 с назад»,
 * «5 мин назад», «3 ч назад», «2 д назад». Будущее считается «только что».
 */
export const formatSince = (at: number, now: number): string => {
  const diff = Math.max(0, now - at);

  if (diff < 1000) return "только что";
  if (diff < MINUTE) return `${Math.floor(diff / 1000)} с назад`;
  if (diff < HOUR) return `${Math.floor(diff / MINUTE)} мин назад`;
  if (diff < DAY) return `${Math.floor(diff / HOUR)} ч назад`;

  return `${Math.floor(diff / DAY)} д назад`;
};

/** Как часто обновлять `formatSince`: секунды — раз в секунду, дальше реже. */
export const sinceTickMs = (at: number, now: number): number => {
  const diff = now - at;

  if (diff < MINUTE) return 1000;
  if (diff < HOUR) return 15_000;

  return MINUTE;
};
