import { useChartScales } from "../hooks/chart-scales-context";

export interface ChartPlotClipProps {
  id: string;
}

/** Прямоугольник области графика: аннотации за её пределы не вылезают. */
export const ChartPlotClip = ({ id }: ChartPlotClipProps) => {
  const { innerWidth, innerHeight } = useChartScales();

  return (
    <defs>
      <clipPath id={id}>
        <rect x={0} y={0} width={innerWidth} height={innerHeight} />
      </clipPath>
    </defs>
  );
};
