import type { ReactNode } from "react";

export interface ChartEmptyProps {
  children: ReactNode;
}

export const ChartEmpty = ({ children }: ChartEmptyProps) => (
  <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
    {children}
  </div>
);
