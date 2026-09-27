import { cn } from "@shared/lib/utils";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import * as React from "react";

import { Button } from "../button";
import { usePagination } from "./hooks";
import { type PaginationSize } from "./pagination.types";
import { PaginationButton } from "./PaginationButton";
import { PaginationEllipsis } from "./PaginationEllipsis";

export interface PaginationProps extends Omit<
  React.HTMLAttributes<HTMLElement>,
  "onChange"
> {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  showFirstLast?: boolean;
  /** См. `usePagination`: сколько элементов показывать в ряду. */
  maxVisible?: number;
  size?: PaginationSize;
  /** Блокирует все кнопки, например пока грузится страница. */
  disabled?: boolean;
}

const NAV_ICON_CLASS = "h-4 w-4";

const Pagination = React.memo(
  React.forwardRef<HTMLElement, PaginationProps>(
    (
      {
        className,
        size = "md",
        currentPage,
        totalPages,
        onPageChange,
        showFirstLast = false,
        maxVisible,
        disabled = false,
        ...props
      },
      ref,
    ) => {
      const { pages, page, hasPrev, hasNext } = usePagination({
        currentPage,
        totalPages,
        maxVisible,
      });

      const goFirst = () => onPageChange(1);
      const goPrev = () => onPageChange(page - 1);
      const goNext = () => onPageChange(page + 1);
      const goLast = () => onPageChange(totalPages);

      const pageItems = pages.map((item, idx) =>
        item === "ellipsis" ? (
          <PaginationEllipsis key={`ellipsis-${idx}`} size={size} />
        ) : (
          <PaginationButton
            key={item}
            page={item}
            isActive={page === item}
            size={size}
            disabled={disabled}
            onClick={onPageChange}
          />
        ),
      );

      return (
        <nav
          ref={ref}
          aria-label="Пагинация"
          className={cn("flex items-center gap-1", className)}
          {...props}
        >
          {showFirstLast && (
            <Button
              type="button"
              variant="outline"
              size={size}
              onClick={goFirst}
              disabled={disabled || !hasPrev}
              aria-label="Первая страница"
            >
              <ChevronsLeft aria-hidden className={NAV_ICON_CLASS} />
            </Button>
          )}

          <Button
            type="button"
            variant="outline"
            size={size}
            onClick={goPrev}
            disabled={disabled || !hasPrev}
            aria-label="Предыдущая страница"
          >
            <ChevronLeft aria-hidden className={NAV_ICON_CLASS} />
          </Button>

          {pageItems}

          <Button
            type="button"
            variant="outline"
            size={size}
            onClick={goNext}
            disabled={disabled || !hasNext}
            aria-label="Следующая страница"
          >
            <ChevronRight aria-hidden className={NAV_ICON_CLASS} />
          </Button>

          {showFirstLast && (
            <Button
              type="button"
              variant="outline"
              size={size}
              onClick={goLast}
              disabled={disabled || !hasNext}
              aria-label="Последняя страница"
            >
              <ChevronsRight aria-hidden className={NAV_ICON_CLASS} />
            </Button>
          )}
        </nav>
      );
    },
  ),
);

Pagination.displayName = "Pagination";

export { Pagination };
