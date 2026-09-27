import * as React from "react";

export interface SkeletonGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Текст для скринридера (по умолчанию «Загрузка…»). */
  label?: string;
}

/**
 * Обёртка набора скелетонов: один раз объявляет загрузку
 * (`role="status"` + скрытый текст), сами скелетоны скрыты от AT.
 */
const SkeletonGroup = React.forwardRef<HTMLDivElement, SkeletonGroupProps>(
  ({ label = "Загрузка…", children, ...props }, ref) => (
    <div ref={ref} role="status" aria-busy {...props}>
      <span className="sr-only">{label}</span>
      {children}
    </div>
  ),
);

SkeletonGroup.displayName = "SkeletonGroup";

export { SkeletonGroup };
