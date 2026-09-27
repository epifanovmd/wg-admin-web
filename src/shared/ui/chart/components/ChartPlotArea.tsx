import { type ReactNode, type SVGProps, useId } from "react";

import { ChartPlotClip } from "./ChartPlotClip";

export interface ChartPlotAreaProps extends SVGProps<SVGGElement> {
  children: ReactNode;
}

/**
 * Группа, обрезанная по области графика: серии и аннотации за фиксированным
 * доменом не заходят на оси и подписи.
 */
export const ChartPlotArea = ({ children, ...props }: ChartPlotAreaProps) => {
  const clipId = useId();

  return (
    <g {...props}>
      <ChartPlotClip id={clipId} />
      <g clipPath={`url(#${clipId})`}>{children}</g>
    </g>
  );
};
