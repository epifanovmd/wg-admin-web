import { Line } from "@visx/shape";

import type { ChartReferenceLine } from "../chart.types";
import { useChartScales } from "../hooks/chart-scales-context";
import { ANNOTATION_COLOR } from "../utils/annotations";
import { ChartPlotArea } from "./ChartPlotArea";

export interface ChartReferenceLinesProps {
  lines: ChartReferenceLine[];
}

interface ResolvedLine {
  key: string;
  axis: "x" | "y";
  from: { x: number; y: number };
  to: { x: number; y: number };
  label: ChartReferenceLine["label"];
  labelX: number;
  labelY: number;
  anchor: "start" | "end";
  color: string;
  dashed: boolean;
}

const DASH = "4,4";

const LABEL_OFFSET = 4;

const LABEL_TOP = 12;

const LABEL_STYLE = { fontSize: 11, fontFamily: "inherit" } as const;

/** Подпись над линией, а у самого верха области — под ней, иначе её обрежет. */
const labelYFor = (y: number) =>
  y < LABEL_TOP + LABEL_OFFSET ? y + LABEL_TOP : y - LABEL_OFFSET;

/**
 * Подпись вертикальной линии — со стороны, где больше места: в правой
 * половине области она встаёт слева от линии, иначе ушла бы за край.
 */
const xLabelPlacement = (x: number, innerWidth: number) =>
  x > innerWidth / 2
    ? { labelX: x - LABEL_OFFSET, anchor: "end" as const }
    : { labelX: x + LABEL_OFFSET, anchor: "start" as const };

/**
 * Опорные линии поверх серий; подпись — у правого края или у верха линии.
 * Линии обрезаются по области графика, подписи — нет: им можно выйти на поля.
 */
export const ChartReferenceLines = ({ lines }: ChartReferenceLinesProps) => {
  const { yScale, xToPosition, innerWidth, innerHeight } = useChartScales();

  const resolved = lines.flatMap<ResolvedLine>((line, index) => {
    const color = ANNOTATION_COLOR[line.variant ?? "default"];
    const dashed = line.dashed ?? false;

    if (line.y !== undefined) {
      const y = yScale(line.y);

      return [
        {
          key: `y-${index}`,
          axis: "y",
          from: { x: 0, y },
          to: { x: innerWidth, y },
          label: line.label,
          labelX: innerWidth - LABEL_OFFSET,
          labelY: labelYFor(y),
          anchor: "end",
          color,
          dashed,
        },
      ];
    }

    const x = line.x === undefined ? undefined : xToPosition(line.x);

    if (x === undefined || !Number.isFinite(x)) return [];

    return [
      {
        key: `x-${index}`,
        axis: "x",
        from: { x, y: 0 },
        to: { x, y: innerHeight },
        label: line.label,
        ...xLabelPlacement(x, innerWidth),
        labelY: LABEL_TOP,
        color,
        dashed,
      },
    ];
  });

  if (resolved.length === 0) return null;

  const labelled = resolved.filter(item => item.label !== undefined);

  return (
    <>
      <ChartPlotArea pointerEvents="none">
        {resolved.map(item => (
          <g key={item.key} data-chart-reference={item.axis}>
            <Line
              from={item.from}
              to={item.to}
              stroke={item.color}
              strokeWidth={1.5}
              strokeDasharray={item.dashed ? DASH : undefined}
            />
          </g>
        ))}
      </ChartPlotArea>
      <g pointerEvents="none">
        {labelled.map(item => (
          <text
            key={item.key}
            x={item.labelX}
            y={item.labelY}
            textAnchor={item.anchor}
            fill={item.color}
            style={LABEL_STYLE}
          >
            {item.label}
          </text>
        ))}
      </g>
    </>
  );
};
