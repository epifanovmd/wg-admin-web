import { Bar } from "@visx/shape";

import { useChartScales } from "../hooks/chart-scales-context";
import type { UseChartTooltipResult } from "../hooks/use-chart-tooltip";

export interface ChartOverlayProps {
  interaction: UseChartTooltipResult;
  ariaLabel?: string;
}

/**
 * Прозрачный слой над областью графика ловит указатель и клавиатуру:
 * зона наведения шире любой марки, а Tab даёт те же значения без мыши.
 */
export const ChartOverlay = ({ interaction, ariaLabel }: ChartOverlayProps) => {
  const { innerWidth, innerHeight } = useChartScales();

  return (
    <Bar
      width={innerWidth}
      height={innerHeight}
      fill="transparent"
      tabIndex={0}
      role="application"
      aria-label={ariaLabel}
      className="outline-none"
      onTouchStart={interaction.handlePointer}
      onTouchMove={interaction.handlePointer}
      onMouseMove={interaction.handlePointer}
      onMouseLeave={interaction.hide}
      onFocus={interaction.handleFocus}
      onBlur={interaction.hide}
      onKeyDown={interaction.handleKeyDown}
      onClick={interaction.handleClick}
    />
  );
};
