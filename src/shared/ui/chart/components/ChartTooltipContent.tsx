import type { ChartTooltipData } from "../chart.types";

export interface ChartTooltipContentProps<Datum> {
  data: ChartTooltipData<Datum>;
  showTotal?: boolean;
}

/**
 * Значение — главный элемент строки, имя серии вторично: у читателя уже есть
 * серия, ему нужно число. Идентичность несёт цветной штрих рядом, не текст.
 */
export const ChartTooltipContent = <Datum,>({
  data,
  showTotal = false,
}: ChartTooltipContentProps<Datum>) => {
  const hasTotal = showTotal && data.entries.length > 1;

  return (
    <div>
      <ul className="space-y-1">
        {data.entries.map(entry => (
          <li key={entry.key} className="flex items-center gap-2">
            <span
              className="h-0.5 w-3.5 shrink-0 rounded-full"
              style={{ background: entry.color }}
            />
            <span className="min-w-0 flex-1 truncate text-xs text-muted-foreground">
              {entry.label}
            </span>
            <span className="text-xs font-semibold tabular-nums">
              {entry.formatted}
            </span>
          </li>
        ))}
      </ul>

      {hasTotal && (
        <div className="mt-1.5 flex items-center gap-2 border-t pt-1.5">
          <span className="min-w-0 flex-1 text-xs text-muted-foreground">
            Всего
          </span>
          <span className="text-xs font-semibold tabular-nums">
            {data.formattedTotal}
          </span>
        </div>
      )}
    </div>
  );
};
