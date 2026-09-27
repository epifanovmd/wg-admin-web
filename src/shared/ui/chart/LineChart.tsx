import type { LineChartProps } from "./chart.types";
import { ChartBands } from "./components/ChartBands";
import { ChartLineSeries } from "./components/ChartLineSeries";
import { ChartPlotArea } from "./components/ChartPlotArea";
import { ChartReferenceLines } from "./components/ChartReferenceLines";
import { ChartRoot } from "./components/ChartRoot";
import { useChart } from "./hooks/use-chart";

/** Линии по общей оси X с одним тултипом на позицию. */
export const LineChart = <Datum,>({
  data,
  series,
  x,
  xScale,
  xAxis,
  yAxis,
  margin,
  formatValue,
  formatX,
  referenceLines,
  bands,
  curve,
  strokeWidth,
  showPoints,
  ...rootProps
}: LineChartProps<Datum>) => {
  const model = useChart({
    data,
    series,
    x,
    xScale,
    xAxis,
    yAxis,
    margin,
    formatValue,
    formatX,
    referenceLines,
    bands,
    zero: false,
  });

  return (
    <ChartRoot model={model} legendShape="line" {...rootProps}>
      {bands && <ChartBands bands={bands} />}

      <ChartPlotArea>
        {model.visibleSeries.map(item => (
          <ChartLineSeries
            key={item.key}
            series={item}
            curve={curve}
            strokeWidth={strokeWidth}
            showPoints={showPoints}
          />
        ))}
      </ChartPlotArea>

      {referenceLines && <ChartReferenceLines lines={referenceLines} />}
    </ChartRoot>
  );
};
