import type { ChartBand } from "../chart.types";
import { useChartScales } from "../hooks/chart-scales-context";
import { ANNOTATION_COLOR } from "../utils/annotations";
import { ChartPlotArea } from "./ChartPlotArea";

export interface ChartBandsProps {
  bands: ChartBand[];
}

const BAND_OPACITY = 0.12;

const LABEL_OFFSET = 4;

const LABEL_LINE = 12;

const LABEL_STYLE = { fontSize: 11, fontFamily: "inherit" } as const;

/** Горизонтальные полосы под сериями (целевая зона, допустимый диапазон). */
export const ChartBands = ({ bands }: ChartBandsProps) => {
  const { yScale, innerWidth } = useChartScales();

  if (bands.length === 0) return null;

  const resolved = bands.map((band, index) => {
    const top = yScale(Math.max(band.from, band.to));
    const bottom = yScale(Math.min(band.from, band.to));

    return {
      key: index,
      top,
      height: Math.max(0, bottom - top),
      label: band.label,
      color: ANNOTATION_COLOR[band.variant ?? "default"],
    };
  });

  return (
    <ChartPlotArea pointerEvents="none">
      {resolved.map(item => (
        <g key={item.key} data-chart-band="">
          <rect
            x={0}
            y={item.top}
            width={innerWidth}
            height={item.height}
            fill={item.color}
            fillOpacity={BAND_OPACITY}
          />
          {item.label !== undefined && (
            <text
              x={LABEL_OFFSET}
              y={item.top + LABEL_LINE}
              fill={item.color}
              style={LABEL_STYLE}
            >
              {item.label}
            </text>
          )}
        </g>
      ))}
    </ChartPlotArea>
  );
};
