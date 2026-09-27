/** Плавная кривая-заглушка в координатах 100×100 (y растёт вниз). */
const CURVE =
  "M0,62 C10,52 18,40 28,46 C38,52 44,70 55,60 C66,50 72,28 83,34 C91,38 96,48 100,44";

/** Пока данные едут, место графика держит форму area — без скачка лейаута. */
export const ChartSkeleton = () => (
  <div className="h-full w-full animate-pulse px-2 pb-6">
    <svg
      className="h-full w-full"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      aria-hidden
    >
      <path d={`${CURVE} L100,100 L0,100 Z`} className="fill-muted" />
      <path
        d={CURVE}
        fill="none"
        strokeWidth={2}
        vectorEffect="non-scaling-stroke"
        className="stroke-muted-foreground/25"
      />
    </svg>
  </div>
);
