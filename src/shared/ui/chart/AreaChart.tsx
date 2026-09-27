import type { AreaChartProps } from "./chart.types";
import { ChartAreaSeries } from "./components/ChartAreaSeries";
import { ChartBands } from "./components/ChartBands";
import { ChartPlotArea } from "./components/ChartPlotArea";
import { ChartReferenceLines } from "./components/ChartReferenceLines";
import { ChartRoot } from "./components/ChartRoot";
import { useChart } from "./hooks/use-chart";

/** Области от нуля; со `stacked` серии складываются друг на друга. */
export const AreaChart = <Datum,>({
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
  stacked = false,
  fillOpacity,
  strokeWidth,
  ...rootProps
}: AreaChartProps<Datum>) => {
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
    zero: true,
    stacked,
  });

  return (
    <ChartRoot
      model={model}
      legendShape="area"
      showTotal={stacked}
      {...rootProps}
    >
      {bands && <ChartBands bands={bands} />}

      <ChartPlotArea>
        {model.visibleSeries.map(item => (
          <ChartAreaSeries
            key={item.key}
            series={item}
            curve={curve}
            fillOpacity={fillOpacity}
            strokeWidth={strokeWidth}
          />
        ))}
      </ChartPlotArea>

      {referenceLines && <ChartReferenceLines lines={referenceLines} />}
    </ChartRoot>
  );
};
