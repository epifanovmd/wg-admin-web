/** Как часто очищать записи User Timing в режиме разработки. */
const CLEAR_EVERY_MS = 10_000;

/**
 * React 19 в режиме разработки пишет каждый рендер в `performance.measure` с
 * разницей пропсов, а браузер хранит эти записи до явной очистки. На страницах
 * с живыми данными (рендер каждую секунду, графики из сотен точек) вкладка за
 * минуты исчерпывает память. Буфер периодически очищается; панель Performance
 * при записи профиля получает записи независимо от буфера. Продакшн-сборка React
 * таких записей не делает.
 */
export const clearDevPerformanceEntries = (
  isDev: boolean = import.meta.env.DEV,
): (() => void) | undefined => {
  if (!isDev || typeof performance?.clearMeasures !== "function") return;

  const timer = setInterval(() => performance.clearMeasures(), CLEAR_EVERY_MS);

  return () => clearInterval(timer);
};
