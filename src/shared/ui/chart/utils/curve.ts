import { curveLinear, curveMonotoneX, curveStep } from "@visx/curve";

import type { ChartCurveType } from "../chart.types";

const CURVES = {
  linear: curveLinear,
  monotone: curveMonotoneX,
  step: curveStep,
};

export const resolveCurve = (curve: ChartCurveType = "monotone") =>
  CURVES[curve];
